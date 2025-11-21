import { useState } from 'react';
import { motion } from 'motion/react';
import { UtensilsCrossed, DollarSign, ArrowRight } from 'lucide-react';
import { FilterSection } from './components/filter-section';
import { LocationSearch } from './components/location-search';
import { ShareView } from './components/share-view';
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

export default function App() {
  const [view, setView] = useState<'filters' | 'share'>('filters');
  const [shareUrl, setShareUrl] = useState('');
  
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCosts, setSelectedCosts] = useState<number[]>([]);

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

  const activeFiltersCount =
    selectedCuisines.length + selectedLocations.length + selectedCosts.length;

  if (view === 'share') {
    return (
      <>
        <Toaster position="top-center" />
        <ShareView url={shareUrl} onBack={() => setView('filters')} />
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
