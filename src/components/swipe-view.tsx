import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Heart, Star, MapPin, DollarSign, Info, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Review {
  user: string;
  rating: number;
  text: string;
}

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
  userReviews: Review[];
}

interface SwipeViewProps {
  restaurants: Restaurant[];
  onBack: () => void;
}

export function SwipeView({ restaurants, onBack }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const currentRestaurant = restaurants[currentIndex];

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setTimeout(() => {
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

  // Helper to determine image source
  const getImageSrc = (img: string) => {
    if (img.startsWith('http')) return img;
    return `https://source.unsplash.com/800x1200/?${img.replace(/\s+/g, ',')}`;
  };

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

      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentRestaurant.id}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0, x: 0, rotate: 0 }}
            exit={{
              x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
              opacity: 0,
              rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
              transition: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="w-full h-[65vh] bg-white rounded-3xl shadow-xl overflow-hidden relative touch-none select-none cursor-grab active:cursor-grabbing"
            onClick={() => setShowDetails(true)}
          >
            <div className="h-full relative">
              {/* Image */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={getImageSrc(currentRestaurant.image)}
                  alt={currentRestaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">{currentRestaurant.name}</h2>
                    <p className="text-lg opacity-90">{currentRestaurant.cuisine}</p>
                  </div>
                  <Badge className="bg-green-500 border-0 text-white px-2 py-1 text-sm font-semibold">
                    {currentRestaurant.rating} ★
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm opacity-90 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {currentRestaurant.location}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array(currentRestaurant.cost).fill('$').join('')}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentRestaurant.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs opacity-70">
                  <Info className="size-3" />
                  Tap for details
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleSwipe('left'); }}
            className="w-16 h-16 bg-white rounded-full shadow-lg text-gray-400 flex items-center justify-center border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X className="size-8" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleSwipe('right'); }}
            className="w-16 h-16 bg-red-600 rounded-full shadow-lg shadow-red-200 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
          >
            <Heart className="size-8 fill-current" />
          </motion.button>
        </div>
      </main>

      {/* Details Sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{currentRestaurant.name}</SheetTitle>
            <SheetDescription>Restaurant details for {currentRestaurant.name}</SheetDescription>
          </SheetHeader>
          <div className="h-full overflow-y-auto pb-8">
            {/* Header Image */}
            <div className="h-64 relative">
              <ImageWithFallback
                src={getImageSrc(currentRestaurant.image)}
                alt={currentRestaurant.name}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 rounded-full"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{currentRestaurant.name}</h2>
                <Badge variant="outline" className="text-sm">
                  {Array(currentRestaurant.cost).fill('$').join('')}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="size-4" />
                {currentRestaurant.location} • {currentRestaurant.cuisine}
              </div>

              <div className="space-y-6">
                {/* Top Dishes */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Top Dishes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {currentRestaurant.topDishes.map((dish, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-sm font-medium">{dish}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Reviews</h3>
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <Star className="size-4 fill-current" />
                      {currentRestaurant.rating} ({currentRestaurant.reviews})
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentRestaurant.userReviews.map((review, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{review.user}</span>
                          <div className="flex items-center text-yellow-500 text-xs">
                            {Array(review.rating).fill('★').join('')}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-24" /> {/* Spacer for bottom buttons */}
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2" onClick={() => { setShowDetails(false); handleSwipe('left'); }}>
              <X className="size-4" />
              Reject
            </Button>
            <Button className="flex-1 h-12 rounded-xl gap-2 bg-red-600 hover:bg-red-700" onClick={() => { setShowDetails(false); handleSwipe('right'); }}>
              <Heart className="size-4" />
              Like
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
