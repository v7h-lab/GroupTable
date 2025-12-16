import { Restaurant } from '../components/swipe-view';

// Use Netlify function for production, direct API for local development
const isDevelopment = import.meta.env.DEV;
const YELP_API_KEY = import.meta.env.DEV ? import.meta.env.VITE_YELP_API_KEY : '';
const YELP_API_URL = isDevelopment
  ? 'https://api.yelp.com/ai/chat/v2'
  : '/.netlify/functions/yelp-proxy';

interface UserPreferences {
  cuisines: string[];
  locations: string[];
  costs: number[];
  date?: string;
  time?: string;
  minRating?: number;
  excludeNames?: string[];
  dietary?: string[];
}

interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  price?: string;
  image_url?: string;
  location?: {
    address1?: string;
    city?: string;
    state?: string;
  };
  categories?: { title: string }[];
}

interface YelpAIResponse {
  response: {
    text: string;
    tags?: Array<{
      tag_type: string;
      start: number;
      end: number;
      meta?: {
        business_id?: string;
      };
    }>;
  };
  entities: any[]; // Entities is an array of objects
}

export async function fetchRestaurants(preferences: UserPreferences): Promise<Restaurant[]> {
  // Only check for API key in development mode
  if (isDevelopment && !YELP_API_KEY) {
    console.error('Yelp API Key is missing. Please add VITE_YELP_API_KEY to your .env file.');
    throw new Error('Yelp API Key is missing');
  }

  // Construct a natural language query based on preferences
  // Strip emojis from cuisine names
  const cleanCuisines = preferences.cuisines.map(c => c.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim());

  const cuisineStr = cleanCuisines.length > 0
    ? cleanCuisines.join(', ')
    : 'any cuisine';

  const locationStr = preferences.locations.length > 0
    ? `in ${preferences.locations.join(' or ')}`
    : 'nearby';

  const costStr = preferences.costs.length > 0
    ? `with a price range of ${preferences.costs.map(c => '$'.repeat(c)).join(' or ')}`
    : '';

  const ratingStr = preferences.minRating
    ? `with a rating of at least ${preferences.minRating} stars`
    : '';

  const dietaryStr = preferences.dietary && preferences.dietary.length > 0
    ? `suitable for ${preferences.dietary.map(d => d.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim()).join(' and ')} diets`
    : '';

  const timeStr = preferences.date && preferences.time
    ? `open on ${preferences.date} at ${preferences.time}`
    : '';

  let query = `Recommend popular ${cuisineStr} restaurants ${locationStr} ${costStr} ${ratingStr} ${dietaryStr} ${timeStr} with reviews.`;

  if (preferences.excludeNames && preferences.excludeNames.length > 0) {
    query += ` Do not include these restaurants: ${preferences.excludeNames.join(', ')}.`;
  }

  console.log('Yelp API Request:', {
    url: YELP_API_URL,
    query,
    isDevelopment,
    apiKeyPresent: isDevelopment ? !!YELP_API_KEY : 'using serverless function'
  });

  try {
    const requestBody = {
      query: query,
      user_context: {
        locale: "en_US",
        location: preferences.locations[0] || "San Francisco, CA"
      }
    };

    // Build headers - only include Authorization in development
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };

    if (isDevelopment && YELP_API_KEY) {
      headers['Authorization'] = `Bearer ${YELP_API_KEY}`;
    }

    const MAX_RETRIES = 3;
    let attempt = 0;
    let response;

    while (attempt < MAX_RETRIES) {
      try {
        response = await fetch(YELP_API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        });

        console.log(`Yelp API Response Status (Attempt ${attempt + 1}):`, response.status);

        if (response.ok) {
          break; // Success, exit loop
        }

        if (response.status >= 500) {
          // Server error, throw to trigger retry
          throw new Error(`Server Error: ${response.status}`);
        } else {
          // Client error (4xx), fail immediately
          const errorText = await response.text();
          console.error('Yelp API Error Body:', errorText);
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error?.description || `API Error: ${response.status}`);
          } catch (e) {
            throw new Error(`API Error: ${response.status} - ${errorText}`);
          }
        }
      } catch (error: any) {
        attempt++;
        console.warn(`API Attempt ${attempt} failed:`, error.message);

        if (attempt >= MAX_RETRIES) {
          // If we've exhausted retries, throw the last error
          throw error;
        }

        // Wait before retrying (Exponential Backoff: 1s, 2s, 4s)
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!response) {
      throw new Error('Failed to get response from Yelp API');
    }

    const data: YelpAIResponse = await response.json();
    console.log('Full Yelp API Response:', JSON.stringify(data, null, 2));
    console.log('Entities array:', data.entities);

    // Check if we have entities
    if (!data.entities || data.entities.length === 0) {
      console.warn('No entities found in API response');
      return [];
    }

    // Find the businesses entity
    let businessesEntity = data.entities.find((entity: any) => entity.businesses);

    // Fallback: check if entities themselves are businesses
    if (!businessesEntity && data.entities[0]?.name) {
      console.log('Using entities directly as businesses');
      businessesEntity = { businesses: data.entities };
    }

    if (!businessesEntity || !businessesEntity.businesses) {
      console.warn('No businesses found in entities');
      return [];
    }

    const businesses = businessesEntity.businesses;
    console.log('Found', businesses.length, 'businesses');
    console.log('First business structure:', JSON.stringify(businesses[0], null, 2));

    // Parse response.text to extract review highlights for each business
    const responseText = data.response?.text || '';
    const tags = data.response?.tags || [];

    // Create a map of business_id to review highlights
    const businessReviews: Record<string, string[]> = {};

    if (responseText && tags.length > 0) {
      let currentBusinessId: string | null = null;

      // Sort tags by start position
      const sortedTags = [...tags].sort((a, b) => a.start - b.start);

      for (const tag of sortedTags) {
        if (tag.tag_type === 'business' && tag.meta?.business_id) {
          currentBusinessId = tag.meta.business_id;
          if (!businessReviews[currentBusinessId]) {
            businessReviews[currentBusinessId] = [];
          }
        } else if (tag.tag_type === 'highlight' && currentBusinessId !== null) {
          const highlightText = responseText.substring(tag.start, tag.end);
          if (highlightText && businessReviews[currentBusinessId]) {
            businessReviews[currentBusinessId].push(highlightText);
          }
        }
      }

      console.log('Extracted business reviews:', businessReviews);
    }

    // Map Yelp businesses to our Restaurant interface
    return businesses.map((b: any, index: number) => {
      // Construct a location string
      let locationDisplay = b.location?.city || 'Unknown';
      if (b.location?.address1) {
        locationDisplay = `${b.location.address1}, ${locationDisplay}`;
      }

      // Parse price
      let cost = 2;
      if (typeof b.price === 'string') {
        cost = b.price.length;
      } else if (typeof b.price === 'number') {
        cost = b.price;
      }

      // Extract reviews from response.text highlights and contextual_info
      const reviews: { user: string; rating: number; text: string }[] = [];

      // First, add highlights from the parsed response.text
      const highlights = businessReviews[b.id] || [];
      highlights.forEach((highlight, idx) => {
        reviews.push({
          user: 'Yelp User',
          rating: b.rating || 5,
          text: highlight
        });
      });

      // Then, add the single review_snippet from contextual_info if available
      if (b.contextual_info?.review_snippet) {
        // Remove [[HIGHLIGHT]] and [[ENDHIGHLIGHT]] markers
        const cleanText = b.contextual_info.review_snippet
          .replace(/\[\[HIGHLIGHT\]\]/g, '')
          .replace(/\[\[ENDHIGHLIGHT\]\]/g, '');

        // Only add if it's not already in the highlights
        const isDuplicate = reviews.some(r => r.text === cleanText);
        if (!isDuplicate && cleanText.trim()) {
          reviews.push({
            user: 'Yelp User',
            rating: b.rating || 5,
            text: cleanText
          });
        }
      }

      console.log('Extracted reviews for', b.name, ':', reviews.length, 'review(s)');

      // Extract image URLs from contextual_info.photos or fallback to image_url
      let imageUrl = b.image_url;
      const additionalImages: string[] = [];

      if (b.contextual_info?.photos && Array.isArray(b.contextual_info.photos) && b.contextual_info.photos.length > 0) {
        // Use the first photo as the main image if available
        if (b.contextual_info.photos[0].original_url) {
          imageUrl = b.contextual_info.photos[0].original_url;
        }

        // Add all photos to additionalImages
        b.contextual_info.photos.forEach((photo: any) => {
          if (photo.original_url) {
            additionalImages.push(photo.original_url);
          }
        });
      } else if (!imageUrl) {
        // Fallback to Unsplash if no image URL is available
        imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(b.categories?.[0]?.title || 'restaurant')}`;
      }

      console.log(`Restaurant: ${b.name}, Image URL: ${imageUrl}, Additional Images: ${additionalImages.length}`);

      return {
        id: b.id,
        name: b.name,
        cuisine: b.categories?.[0]?.title || 'Restaurant',
        location: locationDisplay,
        cost: cost,
        rating: b.rating,
        reviews: b.review_count,
        image: imageUrl || '',
        additionalImages: additionalImages,
        tags: ['Great for Groups', 'Casual', 'Good for Kids'], // Placeholder tags
        topDishes: ['Signature Dish', 'Popular Item', 'Chef Special'], // Placeholder dishes
        userReviews: reviews,
        phone: b.phone,
        display_phone: b.phone, // Use raw phone if display_phone not available
        is_closed: false, // Default to open if not specified
        shortSummary: b.summaries?.short,
        longSummary: b.summaries?.long,
        url: b.url
      };
    });

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
}
