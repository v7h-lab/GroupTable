import { useState } from 'react';
import { motion } from 'motion/react';
import { UtensilsCrossed, DollarSign, ArrowRight } from 'lucide-react';
import { FilterSection } from './components/filter-section';
import { LocationSearch } from './components/location-search';
import { ShareView } from './components/share-view';
import { WaitingView } from './components/waiting-view';
import { SwipeView, Restaurant } from './components/swipe-view';
import { Toaster } from 'sonner@2.0.3';

const cuisineOptions = [
  '🍕 Italian',
  '🍜 Asian',
  '🌮 Mexican',
  '🍔 American',
  '🥗 Healthy',
  '🍱 Japanese',
  '🥘 Indian',
  '🥖 French',
  '🇨🇳 Chinese',
  '🇹🇭 Thai',
  '🇻🇳 Vietnamese',
  '🥙 Mediterranean',
  '🇰🇷 Korean',
  '🍖 BBQ',
  '🦀 Seafood',
  '🥯 Breakfast',
  '🍦 Desserts',
  '☕ Coffee',
];

const costOptions = [
  { label: '$', value: 1, desc: 'Budget' },
  { label: '$$', value: 2, desc: 'Moderate' },
  { label: '$$$', value: 3, desc: 'Pricey' },
  { label: '$$$$', value: 4, desc: 'Luxury' },
];

const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Neon Ramen House',
    cuisine: 'Asian',
    location: 'Downtown',
    cost: 2,
    rating: 4.8,
    reviews: 432,
    image: 'asian ramen restaurant',
    tags: ['Late Night', 'Instagram-worthy'],
    topDishes: ['Spicy Miso Ramen', 'Pork Buns', 'Gyoza', 'Matcha Ice Cream'],
    userReviews: [
      { user: 'Sarah J.', rating: 5, text: 'Best ramen in the city! The broth is incredibly rich and flavorful.' },
      { user: 'Mike T.', rating: 4, text: 'Great vibe, but expect a wait on weekends.' }
    ]
  },
  {
    id: 2,
    name: 'The Verde Garden',
    cuisine: 'Healthy',
    location: 'SoHo',
    cost: 3,
    rating: 4.6,
    reviews: 289,
    image: 'healthy restaurant salad bowl',
    tags: ['Vegan Options', 'Organic'],
    topDishes: ['Quinoa Power Bowl', 'Avocado Toast', 'Green Smoothie', 'Falafel Wrap'],
    userReviews: [
      { user: 'Jessica L.', rating: 5, text: 'So many delicious vegan options. The avocado toast is a must-try.' },
      { user: 'David R.', rating: 4, text: 'Fresh ingredients and nice atmosphere.' }
    ]
  },
  {
    id: 3,
    name: 'Taco Fuego',
    cuisine: 'Mexican',
    location: 'Brooklyn',
    cost: 1,
    rating: 4.9,
    reviews: 721,
    image: 'mexican tacos restaurant',
    tags: ['Spicy', 'Casual Vibe'],
    topDishes: ['Al Pastor Tacos', 'Street Corn', 'Guacamole', 'Churros'],
    userReviews: [
      { user: 'Carlos M.', rating: 5, text: 'Authentic street tacos. The al pastor is amazing!' },
      { user: 'Emily W.', rating: 5, text: 'Incredible value for the quality. Love this place.' }
    ]
  },
  {
    id: 4,
    name: 'Bella Notte',
    cuisine: 'Italian',
    location: 'Midtown',
    cost: 3,
    rating: 4.7,
    reviews: 564,
    image: 'italian pizza restaurant',
    tags: ['Romantic', 'Date Night'],
    topDishes: ['Truffle Pasta', 'Margherita Pizza', 'Tiramisu', 'Burrata'],
    userReviews: [
      { user: 'Amanda K.', rating: 5, text: 'Perfect spot for a date night. The pasta is handmade and delicious.' },
      { user: 'John D.', rating: 4, text: 'A bit pricey, but worth it for the ambiance and food quality.' }
    ]
  },
  {
    id: 5,
    name: 'Burger Collective',
    cuisine: 'American',
    location: 'Chelsea',
    cost: 2,
    rating: 4.5,
    reviews: 892,
    image: 'gourmet burger restaurant',
    tags: ['Craft Beer', 'Group Friendly'],
    topDishes: ['The Classic Burger', 'Truffle Fries', 'Milkshakes', 'Onion Rings'],
    userReviews: [
      { user: 'Chris P.', rating: 5, text: 'Best burgers in town hands down. Great beer selection too.' },
      { user: 'Lisa M.', rating: 4, text: 'Crowded and loud, but the food is fantastic.' }
    ]
  },
  {
    id: 6,
    name: 'Sakura Omakase',
    cuisine: 'Japanese',
    location: 'Upper East',
    cost: 4,
    rating: 4.9,
    reviews: 201,
    image: 'japanese sushi omakase',
    tags: ['Reservation Only', 'Fine Dining'],
    topDishes: ['Omakase Set', 'Toro Sashimi', 'Uni', 'Wagyu Beef'],
    userReviews: [
      { user: 'Kenji Y.', rating: 5, text: 'An unforgettable dining experience. The fish is incredibly fresh.' },
      { user: 'Rachel S.', rating: 5, text: 'Expensive but absolutely worth every penny for special occasions.' }
    ]
  },
  {
    id: 7,
    name: 'Seoul BBQ',
    cuisine: 'Korean',
    location: 'Queens',
    cost: 3,
    rating: 4.7,
    reviews: 350,
    image: 'korean bbq restaurant',
    tags: ['Interactive', 'Group Friendly'],
    topDishes: ['Galbi', 'Bulgogi', 'Kimchi Pancake', 'Bibimbap'],
    userReviews: [
      { user: 'Hannah K.', rating: 5, text: 'Fun experience grilling your own meat. Great for groups!' },
      { user: 'Tom H.', rating: 4, text: 'Delicious sides (banchan) and high quality meat.' }
    ]
  },
  {
    id: 8,
    name: 'Le Petit Bistro',
    cuisine: 'French',
    location: 'West Village',
    cost: 3,
    rating: 4.6,
    reviews: 410,
    image: 'french bistro restaurant',
    tags: ['Cozy', 'Brunch'],
    topDishes: ['Steak Frites', 'Onion Soup', 'Escargot', 'Croque Madame'],
    userReviews: [
      { user: 'Sophie B.', rating: 5, text: 'Feels like a little slice of Paris. The steak frites is perfect.' },
      { user: 'Mark L.', rating: 4, text: 'Charming atmosphere and excellent service.' }
    ]
  }
];

export default function App() {
  const [view, setView] = useState<'filters' | 'share' | 'waiting' | 'swipe'>('filters');
  const [shareUrl, setShareUrl] = useState('');
  
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCosts, setSelectedCosts] = useState<number[]>([]);
  const [sessionParticipants, setSessionParticipants] = useState(2);

  const toggleFilter = <T extends string | number>(
    value: T,
    selected: T[],
    setSelected: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const addLocation = (location: string) => {
    if (!selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const removeLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
  };

  const handleNext = () => {
    // Generate a mock unique URL
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const url = `https://yelpclone.app/group/${uniqueId}`;
    setShareUrl(url);
    setView('share');
  };

  const handleStartSession = (count: number) => {
    setSessionParticipants(count);
    setView('waiting');
  };

  const activeFiltersCount =
    selectedCuisines.length + selectedLocations.length + selectedCosts.length;

  // Filter restaurants based on selection for the swipe view
  // If no filters are selected, show all
  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    // Parse cuisine from the restaurant string (e.g. "🍜 Asian") vs selected (e.g. "Asian")
    // The mock data has clean strings "Asian", "Italian" etc. 
    // The options have emojis "🍜 Asian". We need to match these.
    
    // Simple match: check if any selected cuisine string contains the restaurant cuisine
    const matchesCuisine = selectedCuisines.length === 0 || selectedCuisines.some(c => c.includes(restaurant.cuisine));
    
    // Location match (exact or partial since options are cities)
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.some(l => restaurant.location.includes(l) || l.includes(restaurant.location));
    
    const matchesCost = selectedCosts.length === 0 || selectedCosts.includes(restaurant.cost);
    
    return matchesCuisine && matchesLocation && matchesCost;
  });

  // If filtering results in 0, show all (fallback) so the swipe view isn't empty
  const restaurantsToSwipe = filteredRestaurants.length > 0 ? filteredRestaurants : mockRestaurants;

  if (view === 'share') {
    return (
      <>
        <Toaster position="top-center" />
        <ShareView 
          url={shareUrl} 
          onBack={() => setView('filters')} 
          onStartSession={handleStartSession}
        />
      </>
    );
  }

  if (view === 'waiting') {
    return (
      <>
        <Toaster position="top-center" />
        <WaitingView 
          filters={{
            cuisine: selectedCuisines,
            location: selectedLocations,
            cost: selectedCosts
          }}
          totalParticipants={sessionParticipants}
          onStart={() => setView('swipe')}
          onBack={() => setView('share')}
        />
      </>
    );
  }

  if (view === 'swipe') {
    return (
      <>
        <Toaster position="top-center" />
        <SwipeView 
          restaurants={restaurantsToSwipe} 
          onBack={() => setView('filters')} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto px-4 py-4 max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-xl">
                <UtensilsCrossed className="size-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Yelp<span className="text-red-600">Clone</span>
              </h1>
            </div>
            
            {activeFiltersCount > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => {
                  setSelectedCuisines([]);
                  setSelectedLocations([]);
                  setSelectedCosts([]);
                }}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Clear all
              </motion.button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto px-4 py-6 max-w-md">
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <FilterSection
            title="Cuisine"
            icon={<UtensilsCrossed className="size-4" />}
            options={cuisineOptions}
            selected={selectedCuisines}
            onToggle={(value) => toggleFilter(value, selectedCuisines, setSelectedCuisines)}
          />

          <LocationSearch
            selectedLocations={selectedLocations}
            onAddLocation={addLocation}
            onRemoveLocation={removeLocation}
          />

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <DollarSign className="size-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Price Range</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {costOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFilter(option.value, selectedCosts, setSelectedCosts)}
                  className={`px-2 py-3 rounded-xl transition-all ${
                    selectedCosts.includes(option.value)
                      ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs opacity-80">{option.desc}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Next */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40 pointer-events-none">
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="pointer-events-auto bg-red-600 text-white px-8 py-4 rounded-full shadow-xl shadow-red-200 flex items-center gap-3 font-semibold text-lg"
        >
          <span>Next</span>
          <ArrowRight className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}