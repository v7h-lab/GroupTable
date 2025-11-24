import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface LocationSearchProps {
  selectedLocations: string[];
  onAddLocation: (location: string) => void;
  onRemoveLocation: (location: string) => void;
}

const popularLocations = [
  'San Francisco',
  'Oakland',
  'San Jose',
  'Berkeley',
  'Palo Alto',
  'Mountain View',
  'Santa Clara',
  'San Mateo',
  'Marin',
  'Walnut Creek',
  'Sausalito',
  'Redwood City',
];

export function LocationSearch({
  selectedLocations,
  onAddLocation,
  onRemoveLocation,
}: LocationSearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredLocations = popularLocations.filter(
    (location) =>
      location.toLowerCase().includes(searchValue.toLowerCase()) &&
      !selectedLocations.includes(location)
  );

  const handleAddLocation = (location: string) => {
    onAddLocation(location);
    setSearchValue('');
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      handleAddLocation(searchValue.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-red-600 p-1.5 rounded-lg">
          <MapPin className="size-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900">Location <span className="text-red-600">*</span></span>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Input
          type="text"
          placeholder="Search & add locations..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyPress={handleKeyPress}
          className="pr-10 border-gray-200 focus:border-red-400 focus:ring-red-400"
        />
        {searchValue && (
          <button
            onClick={() => handleAddLocation(searchValue)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && searchValue && filteredLocations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 bg-gray-50 rounded-xl p-2 max-h-48 overflow-y-auto"
          >
            {filteredLocations.slice(0, 5).map((location) => (
              <button
                key={location}
                onClick={() => handleAddLocation(location)}
                className="w-full text-left px-3 py-2 hover:bg-white rounded-lg transition-colors flex items-center gap-2"
              >
                <MapPin className="size-4 text-gray-400" />
                <span>{location}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Locations */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {selectedLocations.map((location) => (
              <motion.div
                key={location}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                layout
              >
                <Badge className="bg-red-600 text-white border-0 pr-1 pl-3 py-1.5 gap-1">
                  {location}
                  <button
                    onClick={() => onRemoveLocation(location)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Quick Add Popular Locations */}
      {selectedLocations.length === 0 && !searchValue && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Popular locations:</p>
          <div className="flex flex-wrap gap-2">
            {popularLocations.slice(0, 4).map((location) => (
              <motion.button
                key={location}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddLocation(location)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                + {location}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
