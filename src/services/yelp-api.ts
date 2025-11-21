import { Restaurant } from '../components/swipe-view';

const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
const YELP_API_URL = 'https://api.yelp.com/ai/chat/v2';

interface UserPreferences {
  cuisines: string[];
  locations: string[];
  costs: number[];
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
  };
  entities?: any[]; // Entities is an array of objects
}

export async function fetchRestaurants(preferences: UserPreferences): Promise<Restaurant[]> {
  if (!YELP_API_KEY) {
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

  const query = `Recommend popular ${cuisineStr} restaurants ${locationStr} ${costStr} with reviews.`;

  console.log('Yelp API Request:', { url: YELP_API_URL, query, apiKeyPresent: !!YELP_API_KEY });

  try {
    const response = await fetch(YELP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        user_context: {
          locale: "en_US",
          location: preferences.locations[0] || "San Francisco, CA"
        }
      })
    });

    console.log('Yelp API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Yelp API Error Body:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.description || `API Error: ${response.status}`);
      } catch (e) {
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    }

    const data: YelpAIResponse = await response.json();
    console.log('Yelp API Data:', JSON.stringify(data, null, 2));

    let businesses: any[] = [];

    if (Array.isArray(data.entities)) {
      for (const entity of data.entities) {
        if (entity.type === 'business') {
          businesses.push(entity);
        } else if (entity.businesses && Array.isArray(entity.businesses)) {
          businesses.push(...entity.businesses);
        }
      }
    } else if ((data.entities as any)?.businesses) {
      // Fallback for object structure if it changes
      businesses = (data.entities as any).businesses;
    }

    if (businesses.length === 0) {
      console.warn('No businesses found in API response entities');
      return [];
    }

    // Map Yelp businesses to our Restaurant interface
    return businesses.map((b, index) => {
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

      // Map reviews
      const reviews = [];
      if (b.review_snippet) {
        reviews.push({
          user: 'Yelp Reviewer',
          rating: b.rating || 5,
          text: b.review_snippet.text || b.review_snippet
        });
      }

      return {
        id: b.id || `yelp-${index}`,
        name: b.name,
        cuisine: b.categories?.[0]?.title || 'Restaurant',
        location: locationDisplay,
        cost: cost,
        rating: b.rating || 0,
        reviews: b.review_count || 0,
        image: b.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', // Fallback image
        tags: b.categories?.map((c: any) => c.title).slice(0, 3) || [],
        topDishes: [], // API might not return this directly in the business object, leaving empty for now
        userReviews: reviews
      };
    });

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
}
