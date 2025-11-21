import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, ArrowLeft, MapPin, UtensilsCrossed, DollarSign, Play, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface WaitingViewProps {
  filters: {
    cuisine: string[];
    location: string[];
    cost: number[];
  };
  totalParticipants: number;
  onStart: () => void;
  onBack: () => void;
}

interface Participant {
  id: string;
  initials: string;
  name: string;
  joined: boolean;
  isSelf?: boolean;
}

const MOCK_NAMES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn'];

export function WaitingView({ filters, totalParticipants, onStart, onBack }: WaitingViewProps) {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'self', initials: 'YO', name: 'You', joined: true, isSelf: true }
  ]);

  // Generate placeholders
  const placeholders = Array(totalParticipants - 1).fill(null).map((_, i) => ({
    id: `placeholder-${i}`,
    initials: '',
    name: 'Waiting...',
    joined: false
  }));

  const [displayList, setDisplayList] = useState([...participants, ...placeholders]);

  // Simulate users joining
  useEffect(() => {
    let joinedCount = 1;
    const max = totalParticipants;
    
    const interval = setInterval(() => {
      if (joinedCount >= max) {
        clearInterval(interval);
        return;
      }

      // Add a new user
      const newName = MOCK_NAMES[joinedCount - 1] || `User ${joinedCount + 1}`;
      const newParticipant = {
        id: `user-${joinedCount}`,
        initials: newName.substring(0, 2).toUpperCase(),
        name: newName,
        joined: true
      };
      
      setDisplayList(prev => {
        const newList = [...prev];
        newList[joinedCount] = newParticipant;
        return newList;
      });

      joinedCount++;
      toast.success(`${newName} joined the session!`);
      
    }, 2500); // New user every 2.5 seconds

    return () => clearInterval(interval);
  }, [totalParticipants]);

  const joinedCount = displayList.filter(p => p.joined).length;
  const progress = (joinedCount / totalParticipants) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-gray-100">
          <ArrowLeft className="size-6 text-gray-600" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col px-4 pb-8 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for friends...</h2>
          <p className="text-gray-500">
            {joinedCount} of {totalParticipants} people are ready
          </p>
        </div>

        {/* Session Details Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Session Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <UtensilsCrossed className="size-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">Cuisine</div>
                <div className="flex flex-wrap gap-1">
                  {filters.cuisine.length > 0 ? (
                    filters.cuisine.map(c => (
                      <Badge key={c} variant="secondary" className="bg-red-50 text-red-700 border-red-100">
                        {c}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">Any</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">Location</div>
                <div className="flex flex-wrap gap-1">
                  {filters.location.length > 0 ? (
                    filters.location.map(l => (
                      <Badge key={l} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                        {l}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">Any</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="size-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">Price Range</div>
                <div className="flex flex-wrap gap-1">
                  {filters.cost.length > 0 ? (
                    filters.cost.map(c => (
                      <Badge key={c} variant="secondary" className="bg-green-50 text-green-700 border-green-100">
                        {Array(c).fill('$').join('')}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">Any</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-items-center">
            {displayList.map((participant, idx) => (
              <motion.div
                key={participant.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-4 shadow-sm transition-all
                  ${participant.joined 
                    ? 'bg-white border-green-500 text-gray-900' 
                    : 'bg-gray-100 border-gray-200 text-gray-300 border-dashed'
                  }
                  ${participant.isSelf ? 'border-red-500' : ''}
                `}>
                  {participant.joined ? (
                    participant.initials
                  ) : (
                    <User className="size-6 opacity-50" />
                  )}
                </div>
                <span className={`text-xs font-medium text-center max-w-[4rem] truncate ${participant.joined ? 'text-gray-700' : 'text-gray-400'}`}>
                  {participant.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-8">
           {/* Progress Bar */}
           <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-6">
             <motion.div 
               className="h-full bg-green-500"
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.5 }}
             />
           </div>

           <Button 
             className="w-full h-14 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 rounded-xl gap-2"
             onClick={onStart}
             disabled={joinedCount < 2 && totalParticipants > 1}
           >
             <Play className="size-5 fill-current" />
             {joinedCount === totalParticipants ? 'Start Swiping!' : 'Start Now Anyway'}
           </Button>
           {joinedCount < totalParticipants && (
             <p className="text-center text-xs text-gray-400 mt-3">
               Waiting for everyone gives the best results
             </p>
           )}
        </div>
      </main>
    </div>
  );
}
