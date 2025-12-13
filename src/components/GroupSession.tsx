import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { JoinSessionView } from './join-session-view';
import { WaitingView, Participant } from './waiting-view';
import { SwipeView, Restaurant } from './swipe-view';
import { Toaster, toast } from 'sonner';
import { fetchRestaurants } from '../services/yelp-api';
import { motion } from 'motion/react';
import { Star, MapPin, Phone, Globe, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

// Mock Reservation Page Component
function ReservationView({ restaurant, onBack, groupSize, time, date }: { restaurant: Restaurant, onBack: () => void, groupSize?: number, time?: string, date?: string }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pt-6">
            {/* Top Nav Area */}
            <div className="w-full max-w-md mb-4 flex items-center">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="size-6" />
                </button>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="relative" style={{ height: '200px' }}>
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                        <h1 className="text-3xl font-bold text-white leading-tight">{restaurant.name}</h1>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-red-50 p-2 rounded-full shrink-0">
                                <MapPin className="text-red-600 size-5" />
                            </div>
                            <span className="font-medium">{restaurant.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-red-50 p-2 rounded-full shrink-0">
                                <Phone className="text-red-600 size-5" />
                            </div>
                            <span className="font-medium">(555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-red-50 p-2 rounded-full shrink-0">
                                <Globe className="text-red-600 size-5" />
                            </div>
                            <a href="#" className="underline font-medium hover:text-red-600">Visit Website</a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-red-50 p-2 rounded-full shrink-0">
                                <Clock className="text-red-600 size-5" />
                            </div>
                            <span className="font-medium">Open Now • Closes 10 PM</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-4">
                        <h3 className="font-bold text-lg text-gray-900">Make a Reservation</h3>

                        {/* Session Summary */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-500">Group Size</span>
                                <span className="font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">{groupSize || 2} People</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-500">Date & Time</span>
                                <span className="font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                                    {date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'} • {time || 'Now'}
                                </span>
                            </div>
                        </div>

                        <button className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 hover:bg-red-700 transition-colors">
                            Book Table
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Ranked List Component
function RankedListView({ restaurants, votes, onBack }: { restaurants: Restaurant[], votes: Record<string, string[]>, onBack: () => void }) {
    // Calculate top 3
    const ranked = restaurants.map(r => ({
        ...r,
        voteCount: votes[r.id]?.length || 0
    }))
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Top Picks</h1>
            <div className="space-y-4">
                {ranked.map((r, index) => (
                    <div key={r.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 items-center">
                        <div className="font-bold text-2xl text-gray-300">#{index + 1}</div>
                        <img src={r.image} alt={r.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{r.name}</h3>
                            <div className="text-sm text-gray-500">{r.voteCount} votes</div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onBack} className="mt-8 w-full py-4 text-gray-500 font-medium">Back to Filters</button>
        </div>
    );
}



export default function GroupSession() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<{ name: string; email: string; id: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [match, setMatch] = useState<Restaurant | null>(null);
    const [showRanked, setShowRanked] = useState(false);
    const [viewReservation, setViewReservation] = useState<Restaurant | null>(null);
    const hasCelebratedRef = useRef(false);

    // Trigger confetti on match
    useEffect(() => {
        if (sessionData?.status === 'matched' && match && !hasCelebratedRef.current) {
            hasCelebratedRef.current = true;
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [sessionData?.status, match]);

    // Listen to session updates
    useEffect(() => {
        if (!sessionId) return;

        const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                console.log("Session Data Loaded:", data); // Debug log
                console.log("Session Filters:", data.filters); // Debug log
                setSessionData(data);

                if (data.restaurants) {
                    setRestaurants(data.restaurants);
                }

                // Check for match
                if (data.status === 'matched' && data.matchId) {
                    const matchRest = data.restaurants.find((r: Restaurant) => r.id === data.matchId);
                    if (matchRest) setMatch(matchRest);
                }
            } else {
                toast.error('Session not found');
                navigate('/');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sessionId, navigate]);

    const handleJoin = async (name: string, email: string) => {
        if (!sessionId || !sessionData) return;

        const isHostUser = localStorage.getItem('group_table_user_id') === sessionData.hostId;
        const hostAlreadyJoined = sessionData.participants?.some((p: any) => p.id === sessionData.hostId);
        const currentCount = sessionData.participants?.length || 0;
        const max = sessionData.groupSize;

        if (isHostUser) {
            // Host can always join if there is space
            if (currentCount >= max) {
                toast.error(`This session is full (Max: ${max} participants)`);
                return;
            }
        } else {
            // Non-host logic
            let limit = max;
            if (!hostAlreadyJoined) {
                limit = max - 1; // Reserve 1 spot for the host
            }

            if (currentCount >= limit) {
                toast.error(`This session is full (Max: ${max} participants)`);
                return;
            }
        }

        try {
            // Get or create user ID
            let userId = localStorage.getItem('group_table_user_id');
            if (!userId) {
                userId = Math.random().toString(36).substr(2, 9);
                localStorage.setItem('group_table_user_id', userId);
            }

            const newParticipant = {
                name,
                email,
                id: userId,
                joinedAt: new Date().toISOString(),
                initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                finished: false
            };

            const sessionRef = doc(db, 'sessions', sessionId);
            await updateDoc(sessionRef, {
                participants: arrayUnion(newParticipant)
            });

            setCurrentUser(newParticipant);
        } catch (error) {
            console.error('Error joining session:', error);
            toast.error('Failed to join session');
        }
    };

    const [isStarting, setIsStarting] = useState(false);

    // Track last action timestamp to prevent duplicate toasts
    const lastActionTimeRef = useRef<number>(0);

    const isHost = sessionData?.hostId && currentUser?.id === sessionData.hostId;

    // Check if current user has finished
    const hasUserFinished = sessionData?.participants?.find((p: any) => p.id === currentUser?.id)?.finished;

    // Check if all participants have finished
    const allFinished = sessionData?.participants?.every((p: any) => p.finished);

    // Waiting state: User finished but others haven't
    const waitingForOthers = hasUserFinished && !allFinished;

    const handleUserFinished = async () => {
        if (!sessionId || !currentUser) return;

        // Only update if not already marked as finished
        if (!hasUserFinished) {
            const updatedParticipants = sessionData.participants.map((p: any) =>
                p.id === currentUser.id ? { ...p, finished: true } : p
            );

            await updateDoc(doc(db, 'sessions', sessionId), {
                participants: updatedParticipants
            });
        }
    };

    const handleBackToFilters = async () => {
        if (!sessionId) return;

        // Host ending the session
        await updateDoc(doc(db, 'sessions', sessionId), {
            status: 'ended'
        });
        navigate('/');
    };

    // Listen for session end and load more notifications
    useEffect(() => {
        if (!sessionData) return;

        // Redirect if session ended
        if (sessionData.status === 'ended') {
            toast.info("Host has ended the session");
            navigate('/');
            return;
        }

        // Notify if host loaded more options
        if (sessionData.lastAction && !isHost) {
            const actionTime = sessionData.lastAction.timestamp;

            // Only show toast if this is a new action we haven't seen
            if (actionTime > lastActionTimeRef.current) {
                if (sessionData.lastAction.type === 'loadingMore') {
                    toast.info("Host is finding new options...");
                } else if (sessionData.lastAction.type === 'loadMore') {
                    // We can optionally show another toast here when data actually arrives, 
                    // or just rely on the first one. The previous logic showed "Host chose to view more options"
                    // which is now redundant if we show "Host is finding new options...".
                    // Let's keep it simple and just update the ref so we don't show old toasts.
                }
                lastActionTimeRef.current = actionTime;
            }
        }

    }, [sessionData?.status, sessionData?.lastAction, navigate, isHost]);

    // Background Prefetching
    useEffect(() => {
        const prefetchData = async () => {
            if (!sessionId || !sessionData) return;

            // If data is already there or loading has started, do nothing
            if (sessionData.restaurants?.length > 0 || sessionData.loadingStarted) return;

            try {
                // Mark as loading to prevent others from fetching
                await updateDoc(doc(db, 'sessions', sessionId), {
                    loadingStarted: true
                });

                const results = await fetchRestaurants({
                    cuisines: sessionData.filters.cuisines,
                    locations: sessionData.filters.locations,
                    costs: sessionData.filters.costs,
                    minRating: sessionData.filters.minRating,
                    date: sessionData.filters.date,
                    time: sessionData.filters.time,
                    dietary: sessionData.filters.dietary
                });

                await updateDoc(doc(db, 'sessions', sessionId), {
                    restaurants: results
                });
            } catch (error) {
                console.error("Error prefetching:", error);
                // Reset flag on error so someone else can try
                await updateDoc(doc(db, 'sessions', sessionId), {
                    loadingStarted: false
                });
            }
        };

        prefetchData();
    }, [sessionId, sessionData?.loadingStarted, sessionData?.restaurants]);

    const handleStartSession = async () => {
        if (!sessionId || !sessionData) return;
        setIsStarting(true);

        try {
            // If restaurants are already loaded (by prefetch), just switch status
            if (sessionData.restaurants && sessionData.restaurants.length > 0) {
                await updateDoc(doc(db, 'sessions', sessionId), {
                    status: 'swiping',
                    votes: {}
                });
            } else {
                // Fallback: If prefetch hasn't finished or failed, wait for it or fetch now
                // Ideally, the prefetch effect is already running. 
                // We can just wait for the listener to update, but to be safe/responsive:

                // Check if we need to fetch manually (race condition safety)
                if (!sessionData.loadingStarted) {
                    const results = await fetchRestaurants({
                        cuisines: sessionData.filters.cuisines,
                        locations: sessionData.filters.locations,
                        costs: sessionData.filters.costs,
                        minRating: sessionData.filters.minRating,
                        date: sessionData.filters.date,
                        time: sessionData.filters.time,
                        dietary: sessionData.filters.dietary
                    });

                    await updateDoc(doc(db, 'sessions', sessionId), {
                        status: 'swiping',
                        restaurants: results,
                        votes: {}
                    });
                } else {
                    // If loading started but not finished, we just wait. 
                    // But to avoid being stuck, we can poll or just let the user wait (UI shows loading)
                    // For now, let's assume the prefetch will finish.
                    // We can force a status update if we see data.
                }
            }
        } catch (error) {
            console.error("Error starting session", error);
            toast.error("Failed to start session");
            setIsStarting(false);
        }
    };



    const handleMatch = async (restaurant: Restaurant) => {
        if (!sessionId || !currentUser || !sessionData) return;

        // Optimistic update? No, wait for Firestore
        const currentVotes = sessionData.votes || {};
        const restaurantVotes = currentVotes[restaurant.id] || [];

        // Add user to votes if not already there
        if (!restaurantVotes.includes(currentUser.id)) {
            const newVotes = {
                ...currentVotes,
                [restaurant.id]: [...restaurantVotes, currentUser.id]
            };

            // Check for match
            if (newVotes[restaurant.id].length >= sessionData.groupSize) {
                await updateDoc(doc(db, 'sessions', sessionId), {
                    votes: newVotes,
                    status: 'matched',
                    matchId: restaurant.id
                });
            } else {
                await updateDoc(doc(db, 'sessions', sessionId), {
                    votes: newVotes
                });
            }
        }
    };

    const handleLoadMore = async () => {
        if (!sessionId || !sessionData) return;
        try {
            // Notify others immediately
            await updateDoc(doc(db, 'sessions', sessionId), {
                lastAction: { type: 'loadingMore', timestamp: Date.now() }
            });

            toast.info("Finding new options...");

            const currentNames = sessionData.restaurants.map((r: Restaurant) => r.name);

            const newRestaurants = await fetchRestaurants({
                cuisines: sessionData.filters.cuisines,
                locations: sessionData.filters.locations,
                costs: sessionData.filters.costs,
                minRating: sessionData.filters.minRating,
                date: sessionData.filters.date,
                time: sessionData.filters.time,
                dietary: sessionData.filters.dietary,
                excludeNames: currentNames
            });

            if (newRestaurants.length === 0) {
                toast.error("No new options found!");
                // Reset lastAction so others don't see "Loading..." forever
                await updateDoc(doc(db, 'sessions', sessionId), {
                    lastAction: { type: 'loadMoreEmpty', timestamp: Date.now() }
                });
                return;
            }

            // Reset finished status for all participants
            const resetParticipants = sessionData.participants.map((p: any) => ({ ...p, finished: false }));

            await updateDoc(doc(db, 'sessions', sessionId), {
                status: 'swiping',
                matchId: null,
                votes: {},
                restaurants: newRestaurants, // Replace list
                participants: resetParticipants,
                lastAction: { type: 'loadMore', timestamp: Date.now() }
            });
        } catch (error) {
            console.error("Error loading more:", error);
            toast.error("Failed to load more options");
            // Reset lastAction on error
            await updateDoc(doc(db, 'sessions', sessionId), {
                lastAction: { type: 'loadMoreError', timestamp: Date.now() }
            });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!currentUser) {
        return (
            <>
                <Toaster position="top-center" />
                <JoinSessionView onJoin={handleJoin} isJoining={false} />
            </>
        );
    }

    if (viewReservation) {
        return (
            <ReservationView
                restaurant={viewReservation}
                onBack={() => setViewReservation(null)}
                groupSize={sessionData.groupSize}
                time={sessionData.filters.time}
                date={sessionData.filters.date}
            />
        );
    }

    if (sessionData?.status === 'matched' && match) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-xl p-6 text-center max-w-md w-full"
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="bg-green-100 p-2 rounded-full flex items-center justify-center">
                            <CheckCircle className="size-6 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">It's a Match!</h1>
                    </div>
                    <p className="text-gray-500 mb-6 text-sm">Everyone wants to go to...</p>

                    <div className="rounded-2xl overflow-hidden mb-4 shadow-md">
                        <img src={match.image} alt={match.name} className="w-full object-cover" style={{ height: '180px' }} />
                        <div className="p-3 bg-gray-50">
                            <h2 className="font-bold text-lg">{match.name}</h2>
                            <p className="text-sm text-gray-500">{match.cuisine} • {match.location}</p>
                        </div>
                    </div>

                    {isHost ? (
                        <button
                            onClick={() => setViewReservation(match)}
                            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 hover:bg-red-700 transition-colors"
                        >
                            Book Now
                        </button>
                    ) : (
                        <p className="w-full text-gray-500 py-4 font-medium text-lg text-center">
                            Host will make the reservation
                        </p>
                    )}

                    {sessionData.groupSize > 2 && (
                        <button
                            onClick={() => setShowRanked(true)}
                            className="mt-4 text-gray-500 font-medium"
                        >
                            See other top picks
                        </button>
                    )}
                </motion.div>
            </div>
        );
    }

    if (showRanked) {
        return <RankedListView restaurants={restaurants} votes={sessionData?.votes || {}} onBack={() => navigate('/')} />;
    }

    if (sessionData?.status === 'waiting') {
        return (
            <>
                <Toaster position="top-center" />
                <WaitingView
                    filters={{
                        cuisine: sessionData.filters.cuisines,
                        location: sessionData.filters.locations,
                        cost: sessionData.filters.costs,
                        dietary: sessionData.filters.dietary,
                    }}
                    date={sessionData.filters.date}
                    time={sessionData.filters.time}
                    rating={sessionData.filters.minRating}
                    totalParticipants={sessionData.groupSize}
                    isLoading={isStarting}
                    onStart={handleStartSession}
                    isHost={isHost}
                    participants={sessionData.participants.map((p: any) => ({
                        ...p,
                        joined: true,
                        isSelf: p.id === currentUser.id,
                        isHost: p.id === sessionData.hostId
                    }))}
                    onBack={() => navigate('/')}
                />
            </>
        );
    }




    if (sessionData?.status === 'swiping') {
        // Calculate ranked list for the extraContent
        const votes = sessionData?.votes || {};
        const ranked = restaurants.map(r => ({
            ...r,
            voteCount: votes[r.id]?.length || 0
        }))
            .sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, 3);

        // Only show top picks if group size > 2
        const showTopPicks = sessionData.groupSize > 2;

        const rankedListContent = showTopPicks ? (
            <div className="w-full mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-left">Top Picks So Far</h3>
                <div className="space-y-3">
                    {ranked
                        .filter(r => r.voteCount > 0) // Only show if at least 1 vote
                        .map((r, index) => (
                            <div key={r.id} className="bg-gray-50 p-3 rounded-xl flex gap-3 items-center text-left">
                                <div className="font-bold text-lg text-gray-400">#{index + 1}</div>
                                <img src={r.image} alt={r.name} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{r.name}</h4>
                                    <div className="text-xs text-gray-500">{r.voteCount} votes</div>
                                </div>
                            </div>
                        ))}
                    {ranked.filter(r => r.voteCount > 0).length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-4 italic">
                            No votes yet
                        </div>
                    )}
                </div>
            </div>
        ) : null;

        return (
            <>
                <Toaster position="top-center" />
                <SwipeView
                    restaurants={restaurants}
                    onBack={handleBackToFilters}
                    onMatch={handleMatch}
                    participants={sessionData.participants.length}
                    users={sessionData.participants}
                    extraContent={rankedListContent}
                    onReserve={(restaurant) => setViewReservation(restaurant)}
                    isHost={isHost}
                    onLoadMore={handleLoadMore}
                    onFinished={handleUserFinished}
                    waitingForOthers={waitingForOthers}
                    isLoadingMore={sessionData.lastAction?.type === 'loadingMore'}
                />
            </>
        );
    }

    return <div>Unknown State</div>;
}
