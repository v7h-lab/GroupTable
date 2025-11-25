import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Heart, Star, MapPin, DollarSign, Info, ArrowLeft, Phone, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { Participant } from './waiting-view';

export interface Restaurant {
  id: number | string;
  name: string;
  cuisine: string;
  location: string;
  cost: number;
  rating: number;
  reviews: number;
  image: string;
  additionalImages?: string[]; // Additional photos from the API
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
  participants: number;
  users?: Participant[];
}

export function SwipeView({ restaurants, onMatch, onBack, participants, users }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  // Reset index when restaurants change (to fix stale data/index issues)
  useEffect(() => {
    setCurrentIndex(0);
  }, [restaurants]);

  const currentRestaurant = restaurants[currentIndex];

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setShowDetails(false); // Close details sheet when swiping to prevent stale data

    if (dir === 'right') {
      const newLikeCount = likeCount + 1;
      setLikeCount(newLikeCount);
      if (newLikeCount === 2) {
        setMatchedRestaurant(currentRestaurant);
        setTimeout(() => {
          setShowMatch(true);
        }, 200); // Show match screen after card exit animation
      }
    }

    setTimeout(() => {
      if (dir === 'right') {
        onMatch(currentRestaurant);
      }
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 200);
  };

  const handleContinueSwiping = () => {
    setShowMatch(false);
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
          <div
            className="rounded-full flex items-center justify-center mx-auto mb-6 shrink-0"
            style={{ width: '6rem', height: '6rem', backgroundColor: '#dcfce7' }}
          >
            <Check className="size-12 text-green-600" />
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

  if (showMatch) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="h-[100dvh] bg-red-600 flex flex-col items-center justify-center p-6 text-center z-50 fixed inset-0"
      >
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
          <div className="pt-8 pb-4 px-8 flex flex-col items-center">
            <div className="h-4 w-full" />
            <div className="flex items-center justify-center gap-3 mb-4 mr-8">
              <div
                className="rounded-full flex items-center justify-center shrink-0 animate-bounce"
                style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#fee2e2' }}
              >
                <Heart className="size-8 text-red-600 fill-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">It's a Match!</h2>
            </div>
          </div>

          {/* Hero Image with Details Overlay */}
          <div className="relative w-full shrink-0 group" style={{ height: '8rem' }}>
            <ImageWithFallback
              src={matchedRestaurant?.image || ''}
              alt={matchedRestaurant?.name || ''}
              className="w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 100%)',
              }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-left">
              <h3 className="text-2xl font-bold mb-2">{matchedRestaurant?.name}</h3>
              <div className="flex items-center gap-2 text-sm font-medium flex-wrap">
                <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  {matchedRestaurant?.rating}
                </span>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                  {matchedRestaurant?.cuisine}
                </Badge>
                <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                  {Array(matchedRestaurant?.cost || 1).fill('$').join('')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {/* Going With Section */}
            <div className="flex flex-col gap-3 items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Check className="size-3" /> Everyone wants to go here
              </span>
              <div className="flex -space-x-2 overflow-hidden">
                {(users && users.length > 0 ? users : Array.from({ length: Math.min(participants, 4) })).slice(0, 4).map((user, i) => {
                  const initials = (user as Participant)?.initials || ['AL', 'SA', 'YO', 'MI'][i % 4];
                  return (
                    <div
                      key={i}
                      className="inline-flex h-10 w-10 rounded-full ring-2 ring-white items-center justify-center text-xs font-bold text-gray-600"
                      style={{ backgroundColor: ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af'][i % 4] }}
                    >
                      {initials}
                    </div>
                  );
                })}
              </div>
              {participants > 4 && (
                <div className="text-xs text-gray-500 font-medium pl-1">
                  +{participants - 4} more
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-6 w-full">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white h-14 text-lg rounded-2xl shadow-lg shadow-red-200"
                onClick={() => {
                  // Handle reservation
                }}
              >
                Reserve Table
              </Button>

              <button
                onClick={() => {
                  setShowMatch(false);
                  setMatchedRestaurant(null);
                }}
                className="text-gray-500 font-medium hover:text-gray-800 transition-colors text-sm"
              >
                Keep swiping
              </button>
            </div>
          </div>
        </div>
      </motion.div>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Info button in top right */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(true);
                  }}
                >
                  <Info className="size-5 text-white" />
                </Button>
              </div>

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
                  <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                    {Array(currentRestaurant.cost).fill('$').join('')}
                  </span>
                  <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                    <MapPin className="size-3" />
                    {currentRestaurant.location.split(',').pop()?.trim() || currentRestaurant.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Short Summary for Card View */}
              {currentRestaurant.shortSummary && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentRestaurant.shortSummary}
                </p>
              )}

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
          variant="ghost"
          style={{ backgroundColor: '#ef4444' }}
          className="size-16 rounded-full text-white shadow-lg shadow-red-200 hover:scale-110 transition-all hover:text-white"
          onClick={() => handleSwipe('right')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
        >
          <Heart className="size-8 fill-white" />
        </Button>
      </div>

      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden">
          <style>{`
            [data-radix-dialog-content] > button[type="button"]:first-of-type {
              display: none !important;
            }
          `}</style>
          <div className="h-full overflow-y-auto">
            <div className="relative h-64">
              <ImageWithFallback
                src={currentRestaurant.image}
                alt={currentRestaurant.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Custom close button positioned to overlap default button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute size-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all z-50"
              style={{ top: '13px', right: '13px' }}
              onClick={() => setShowDetails(false)}
            >
              <X className="size-5 text-gray-900" />
            </Button>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentRestaurant.name}</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    {currentRestaurant.rating} ({currentRestaurant.reviews})
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
                <div className="mt-2 text-gray-600 flex items-center gap-2">
                  <MapPin className="size-4" />
                  {currentRestaurant.location}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">
                  {currentRestaurant.longSummary || (
                    <>
                      A popular {currentRestaurant.cuisine.toLowerCase()} restaurant in {currentRestaurant.location}.
                      {currentRestaurant.reviews > 0 && ` Rated ${currentRestaurant.rating} stars based on ${currentRestaurant.reviews} reviews.`}
                    </>
                  )}
                </p>
              </div>

              {currentRestaurant.additionalImages && currentRestaurant.additionalImages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Photos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {currentRestaurant.additionalImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={imgUrl}
                          alt={`${currentRestaurant.name} - Photo ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentRestaurant.userReviews && currentRestaurant.userReviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="size-5 fill-yellow-400 text-yellow-400" />
                    Top Reviews ({currentRestaurant.userReviews.length})
                  </h3>

                  {/* Vertically Stacked Review Cards */}
                  <div className="space-y-3">
                    {currentRestaurant.userReviews.map((review, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          "{review.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 pb-6 flex justify-center gap-6">
                <Button
                  size="lg"
                  className="size-16 rounded-full bg-white text-red-500 shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
                  onClick={() => {
                    handleSwipe('left');
                    setShowDetails(false);
                  }}
                >
                  <X className="size-8" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  style={{ backgroundColor: '#ef4444' }}
                  className="size-16 rounded-full text-white shadow-lg shadow-red-200 hover:scale-110 transition-all hover:text-white"
                  onClick={() => {
                    handleSwipe('right');
                    setShowDetails(false);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  <Heart className="size-8 fill-white" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
