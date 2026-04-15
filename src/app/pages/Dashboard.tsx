import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { Search, MessageSquare, Bell, Moon, Sun, Flame, MoreHorizontal, MapPin, Medal, Target, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

// Mock post generator
const generatePost = (id: number) => ({
  id,
  title: `Trek Action #${id}`,
  description: `Feeling fantastic! Explored an unknown trail segment near sector ${id}. The conditions were absolutely stellar today.`,
  distance: (Math.random() * 15 + 2).toFixed(1),
  elevGain: Math.floor(Math.random() * 500 + 50),
  time: `${Math.floor(Math.random() * 3 + 1)}h ${Math.floor(Math.random() * 59)}m`,
  achievements: Math.floor(Math.random() * 4),
  image: `https://images.unsplash.com/photo-${1500000000000 + id * 10000}?q=80&w=600&auto=format&fit=crop`,
  isPr: Math.random() > 0.7
});

export function Dashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState(() => Array.from({ length: 3 }, (_, i) => generatePost(i + 1)));

  const { ref, inView } = useInView({ rootMargin: '200px' });

  // Hook up realtime integration
  useRealtimeSync({
    onAlertInserted: (alert) => {
      setPosts((current) => [
        {
          id: current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1,
          title: `🚨 EMERGENCY: ${alert.alert_type}`,
          description: `A user has triggered a system ${alert.alert_type} alert on the trail. Emergency contacts have been notified.`,
          distance: '0.0',
          elevGain: 0,
          time: 'Just now',
          achievements: 0,
          image: 'https://images.unsplash.com/photo-1628103004386-319ce925eac?q=80&w=600&auto=format&fit=crop', // Emergency aesthetic
          isPr: false
        },
        ...current
      ]);
    },
    onTrekInserted: (trek) => {
      setPosts((current) => [
        {
          id: current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1,
          title: `🌿 Live Trek Started`,
          description: `A new member just joined the network and began scanning the trail. Safe travels!`,
          distance: '0.0',
          elevGain: 0,
          time: 'Just now',
          achievements: 0,
          image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600&auto=format&fit=crop',
          isPr: false
        },
        ...current
      ]);
    }
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (inView) {
      const loadMore = setTimeout(() => {
        setPosts((current) => [
          ...current,
          ...Array.from({ length: 2 }, (_, i) => generatePost(current.length + i + 1))
        ]);
      }, 1000); // Simulate network latency
      return () => clearTimeout(loadMore);
    }
  }, [inView]);

  const localName = localStorage.getItem('eMotion_fullName') || 'Lead Explorer';
  const localAvatar = localStorage.getItem('eMotion_avatarUrl') || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop';

  return (
    <div className="h-screen flex flex-col bg-stone-100 dark:bg-[#121212] font-opensans transition-colors duration-200 overflow-hidden">
      
      {/* Sticky Header */}
      <header className="shrink-0 z-50 bg-white dark:bg-[#1C1C1E] border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
            <img src={localAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors" onClick={() => toast.info('Search coming soon')}>
            <Search className="w-6 h-6" />
          </button>
        </div>

        <h1 className="font-montserrat font-bold text-lg text-stone-900 dark:text-white absolute left-1/2 -translate-x-1/2">
          Home
        </h1>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-stone-600 dark:text-stone-300 hover:text-[#FF4500] transition-colors"
          >
            {mounted && theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <button className="text-stone-600 dark:text-stone-300 hover:text-[#FF4500] transition-colors" onClick={() => toast.info('Messages coming soon')}>
            <MessageSquare className="w-6 h-6" />
          </button>
          <button className="text-stone-600 dark:text-stone-300 hover:text-[#FF4500] transition-colors relative" onClick={() => toast.info('No new notifications')}>
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF4500] rounded-full border border-white dark:border-[#1C1C1E]"></span>
          </button>
        </div>
      </header>

      {/* Main Content Area: Native Scrolling */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden snap-y snap-proximity relative"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="p-0 sm:p-4 max-w-lg mx-auto pb-4">
          
          {/* Suggested Goal Widget */}
          <section className="snap-start bg-white dark:bg-[#1C1C1E] sm:rounded-b-2xl shadow-sm mb-2 sm:mb-4 border-b sm:border border-stone-200 dark:border-stone-800 p-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <span className="w-6 h-6 rounded-md bg-[#FF4500]/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-[#FF4500]" />
                </span>
                <span className="font-bold text-sm">Suggested Goal</span>
              </div>
              <button className="text-[#FF4500] text-sm font-bold hover:underline" onClick={() => toast.info('Goal customization disabled temporarily')}>
                Customize
              </button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-stone-200 dark:border-stone-700 flex items-center justify-center">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-stone-400 dark:border-stone-500 rounded-bl-sm transform rotate-45 mb-1" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-montserrat text-stone-900 dark:text-white leading-tight">60 km per week</h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm">0 km / 60 km hiked</p>
                </div>
              </div>
              <Button size="sm" className="bg-[#FF4500] hover:bg-[#E03E00] text-white rounded-full px-6 font-bold" onClick={() => toast.success('Goal Activated!')}>
                Set Goal
              </Button>
            </div>
          </section>

          {/* Social Feed Endless Map */}
          {posts.map((post) => (
            <section key={post.id} className="snap-start bg-white dark:bg-[#1C1C1E] mb-2 sm:mb-4 sm:rounded-2xl shadow-sm border-t border-b sm:border border-stone-200 dark:border-stone-800">
              
              <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100">
                    <img src={localAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white font-montserrat">{localName}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">April 10, 2026 at 6:30 AM · eMotion Mobile</p>
                    <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
                      <MapPin className="w-3 h-3" /> Area {post.id}, Kenya
                    </div>
                  </div>
                </div>
                <button className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>

              <div className="px-4 pb-2">
                <h2 className="text-xl font-bold font-montserrat text-stone-900 dark:text-white mb-2">{post.title}</h2>
                <p className="text-stone-700 dark:text-stone-300 text-sm mb-4 line-clamp-2">
                  {post.description}
                </p>
              </div>

              <div className="px-4 pb-4 grid grid-cols-4 gap-2">
                <div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mb-1">Distance</div>
                  <div className="font-montserrat font-bold text-lg text-stone-900 dark:text-white">{post.distance} km</div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mb-1">Elev Gain</div>
                  <div className="font-montserrat font-bold text-lg text-stone-900 dark:text-white">{post.elevGain} m</div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mb-1">Time</div>
                  <div className="font-montserrat font-bold text-lg text-stone-900 dark:text-white">{post.time}</div>
                </div>
                {post.achievements > 0 && (
                  <div className="pl-2">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mb-1">Achievements</div>
                    <div className="flex items-center gap-1 font-bold text-stone-900 dark:text-white">
                      <Medal className="w-4 h-4 text-amber-500" />
                      <span>{post.achievements}</span>
                    </div>
                  </div>
                )}
              </div>

              {post.isPr && (
                <div className="mx-4 mb-4 bg-stone-100 dark:bg-stone-800/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-inner">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-sm text-stone-900 dark:text-white font-montserrat">Your fastest 10k ever!</span>
                </div>
              )}

              <div className="grid grid-cols-2 h-64 gap-1 mt-2">
                <div className="bg-stone-200 dark:bg-stone-800 relative col-span-1 border-r border-white/10 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Map Route" />
                </div>
                <div className="bg-stone-200 dark:bg-stone-800 relative col-span-1 overflow-hidden">
                   {/* Normally this would map to a unique image based on post ID, but we use a static fallback for safety since random unsplash IDs can break */}
                   <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Trail Selfie" />
                   <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                     Workout
                   </div>
                </div>
              </div>
            </section>
          ))}

          {/* Infinite Scroll Loader Trigger */}
          <div ref={ref} className="h-20 flex items-center justify-center snap-start pb-6">
            <Loader2 className="w-6 h-6 text-[#FF4500] animate-spin" />
            <span className="ml-2 text-sm font-bold text-stone-500">Loading old treks...</span>
          </div>

        </div>
      </main>
    </div>
  );
}