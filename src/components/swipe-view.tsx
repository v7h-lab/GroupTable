import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Heart, Star, MapPin, DollarSign, Info, ArrowLeft, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';

export interface Restaurant {
  id: number | string;
  name: string;
  cuisine: string;
  location: string;
  cost: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  topDishes: string[];
  userReviews: {
    user: string;
    rating: number;
    text: string;
  }[];
  phone?: string;
  display_phone?: string;
  is_closed?: boolean;
}

function ImageWithFallback({ src, alt, className }: { src: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleError = () => {
    if (!error) {
      setError(true);
      // Fallback to Unsplash based on alt text (cuisine/name)
      setImgSrc(`https://source.unsplash.com/800x600/?${encodeURIComponent(alt)}`);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

interface SwipeViewProps {
  restaurants: Restaurant[];
  onMatch: (restaurant: Restaurant) => void;
  onBack: () => void;
}

export function SwipeView({ restaurants, onMatch, onBack }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Reset index when restaurants change (to fix stale data/index issues)
  useEffect(() => {
    setCurrentIndex(0);
  }, [restaurants]);

  const currentRestaurant = restaurants[currentIndex];

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setShowDetails(false); // Close details sheet when swiping to prevent stale data
    setTimeout(() => {
      if (dir === 'right') {
        onMatch(currentRestaurant);
      }
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 200);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleSwipe('right');
    } else if (info.offset.x < -100) {
      handleSwipe('left');
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="size-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
          <p className="text-gray-500 mb-8">
            You've viewed all the restaurants. We'll let you know when your friends have voted.
          </p>
          <Button onClick={onBack} variant="outline" className="w-full h-12 rounded-xl">
            Back to Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="p-4 flex items-center justify-between relative z-10">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm">
          <ArrowLeft className="size-6 text-gray-900" />
        </Button>
        <div className="font-semibold text-gray-900">
          {currentIndex + 1} / {restaurants.length}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentRestaurant.id}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0, x: 0, rotate: 0 }}
            exit={{
              x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0,
              opacity: 0,
              rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
              transition: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="w-full bg-white rounded-3xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing relative z-20"
            style={{ height: '65vh' }}
          >
            <div className="relative" style={{ height: '60%' }} onClick={() => setShowDetails(true)}>
              <ImageWithFallback
                src={currentRestaurant.image}
                alt={currentRestaurant.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{currentRestaurant.name}</h2>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                    {currentRestaurant.cuisine}
                  </Badge>
                  <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    {currentRestaurant.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MapPin className="size-4" />
                    {currentRestaurant.location}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array(currentRestaurant.cost).fill('$').join('')}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowDetails(true)}>
                  <Info className="size-6 text-gray-400" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentRestaurant.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 flex justify-center gap-6">
        <Button
          size="lg"
          className="size-16 rounded-full bg-white text-red-500 shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
          onClick={() => handleSwipe('left')}
        >
          <X className="size-8" />
        </Button>
        <Button
          size="lg"
          className="size-16 rounded-full bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 hover:scale-110 transition-all"
          onClick={() => handleSwipe('right')}
        >
          <Heart className="size-8 fill-current" />
        </Button>
      </div>

      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="relative h-64">
              <ImageWithFallback
                src={currentRestaurant.image}
                alt={currentRestaurant.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentRestaurant.name}</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    {currentRestaurant.rating} ({currentRestaurant.reviews} reviews)
                  </span>
                  <span>•</span>
                  <span>{currentRestaurant.cuisine}</span>
                  <span>•</span>
                  <span>{Array(currentRestaurant.cost).fill('$').join('')}</span>
                </div>
                {currentRestaurant.phone && (
                  <div className="mt-2 text-gray-600 flex items-center gap-2">
                    <Phone className="size-4" />
                    {currentRestaurant.phone}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">
                  A popular {currentRestaurant.cuisine.toLowerCase()} restaurant in {currentRestaurant.location}.
                  {currentRestaurant.reviews > 0 && ` Rated ${currentRestaurant.rating} stars based on ${currentRestaurant.reviews} reviews.`}
                </p>
              </div>

              {currentRestaurant.userReviews?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="size-5 fill-yellow-400 text-yellow-400" />
                    Customer Reviews ({currentRestaurant.userReviews.length})
                  </h3>
                  <div className="space-y-3">
                    {currentRestaurant.userReviews.map((review, i) => (
                      <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-semibold text-gray-900">{review.user}</span>
                            <div className="flex items-center gap-1 mt-1">
                              {Array(5).fill(0).map((_, starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`size-4 ${starIdx < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                                />
                              ))}
                              <span className="text-sm text-gray-500 ml-1">{review.rating}/5</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button className="w-full py-6 text-lg rounded-xl bg-red-500 hover:bg-red-600" onClick={() => {
                  onMatch(currentRestaurant);
                  setShowDetails(false);
                }}>
                  Pick this Place!
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
