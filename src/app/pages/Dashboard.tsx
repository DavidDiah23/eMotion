import { useState, useEffect } from 'react';
import { 
  Bell, MapPin, Mountain, Clock, Play, Users, History, ChevronRight, User as UserIcon 
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const data = [
  { name: 'Mon', dist: 4000 },
  { name: 'Tue', dist: 3000 },
  { name: 'Wed', dist: 2000 },
  { name: 'Thu', dist: 2780 },
  { name: 'Fri', dist: 1890 },
  { name: 'Sat', dist: 2390 },
  { name: 'Sun', dist: 3490 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Safely pull from localStorage to persist edits without complex Redux/Context for this demo scale
  const localName = localStorage.getItem('eMotion_fullName') || 'David Diaz';
  const localAvatar = localStorage.getItem('eMotion_avatarUrl') || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop';

  const user = {
    user_metadata: {
      full_name: localName,
      avatar_url: localAvatar
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); 
    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = () => {
    toast('Logging out securely...');
    setTimeout(() => {
      navigate('/login');
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <Mountain className="w-10 h-10 text-[#FF4500] animate-bounce" />
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2E4F2F]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-opensans text-stone-800">
      <header className="sticky top-0 z-50 bg-[#2E4F2F] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3" onClick={() => navigate('/profile-setup')}>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#FF4500] transition-all">
            {user.user_metadata.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <span className="font-semibold text-sm hidden sm:block truncate max-w-[100px]">
            {user.user_metadata.full_name.split(' ')[0]}
          </span>
        </div>
        
        <div onClick={() => navigate('/dashboard')} className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
          <Mountain className="w-6 h-6 text-[#FF4500]" strokeWidth={2} />
          <h1 className="text-xl font-bold font-montserrat tracking-tight">eMotion</h1>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4500] rounded-full ring-2 ring-[#2E4F2F]" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-stone-100 overflow-hidden text-stone-800 z-50">
              <div className="p-3 bg-stone-50 border-b border-stone-100 font-bold font-montserrat text-sm">Notifications</div>
              <div className="p-4 text-sm flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-[#FF4500] shrink-0" />
                <div>
                  <p className="font-semibold">Sarah invited you to a trek</p>
                  <p className="text-xs text-stone-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="p-4 text-sm flex items-start gap-3 border-t border-stone-50">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-stone-300 shrink-0" />
                <div>
                  <p className="font-medium text-stone-600">Weekly goal achieved!</p>
                  <p className="text-xs text-stone-400 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="px-6 py-6 space-y-8 max-w-4xl mx-auto">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-montserrat text-[#2E4F2F]">Active Trek</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wider border border-green-200 animate-pulse">
              Live
            </span>
          </div>
          
          <Card variant="white" className="overflow-hidden border-l-4 border-l-[#FF4500]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-montserrat text-stone-900">Karura Forest Trail</h3>
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Nairobi, Kenya</span>
                </div>
              </div>
              <div className="bg-stone-100 p-3 rounded-lg flex flex-col items-center">
                <Clock className="w-5 h-5 text-[#FF4500] mb-1" />
                <span className="font-mono font-bold text-stone-800">04:12</span>
                <span className="text-[10px] uppercase text-stone-400 font-bold">Duration</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-stone-100 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold font-montserrat text-stone-800">21.0</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide font-bold">km</div>
              </div>
              <div className="text-center border-l border-stone-200">
                <div className="text-2xl font-bold font-montserrat text-stone-800">150</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide font-bold">m</div>
              </div>
              <div className="text-center border-l border-stone-200">
                <div className="text-2xl font-bold font-montserrat text-stone-800">118</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide font-bold">bpm</div>
              </div>
            </div>

            <Button fullWidth className="mt-6 font-bold" onClick={() => navigate('/active-trek')}>
              View Live Map <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-bold font-montserrat text-[#2E4F2F] mb-4">Weekly Activity</h2>
          <Card variant="stone" className="h-64 flex flex-col justify-between">
            <div className="flex justify-between items-end mb-2 px-2">
              <div>
                <span className="text-3xl font-bold font-montserrat text-[#2E4F2F]">24.5</span>
                <span className="text-sm font-medium text-stone-500 ml-1">km</span>
              </div>
              <div className="text-xs font-bold text-stone-400 bg-white px-2 py-1 rounded shadow-sm">
                Last 7 Days
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#2E4F2F', fontWeight: 'bold' }}
                    cursor={{ stroke: '#FF4500', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="dist" stroke="#2E4F2F" strokeWidth={3} fillOpacity={0.1} fill="#2E4F2F" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-bold font-montserrat text-[#2E4F2F] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button onClick={() => navigate('/active-trek')} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-stone-100 hover:shadow-lg active:scale-95 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF4500] transition-colors">
                <Play className="w-6 h-6 text-[#FF4500] group-hover:text-white transition-colors ml-1" />
              </div>
              <span className="font-bold text-sm text-stone-700">Start Trek</span>
            </button>
            
            <button onClick={() => navigate('/join')} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-stone-100 hover:shadow-lg active:scale-95 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#2E4F2F]/10 flex items-center justify-center mb-3 group-hover:bg-[#2E4F2F] transition-colors">
                <Users className="w-6 h-6 text-[#2E4F2F] group-hover:text-white transition-colors" />
              </div>
              <span className="font-bold text-sm text-stone-700">Join Trek</span>
            </button>

            <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-stone-100 hover:shadow-lg active:scale-95 transition-all group sm:col-span-1 col-span-2">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3 group-hover:bg-stone-800 transition-colors">
                <History className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors" />
              </div>
              <span className="font-bold text-sm text-stone-700">History</span>
            </button>
          </div>
        </section>

        <div className="pt-4">
           <Button variant="ghost" fullWidth onClick={handleSignOut} className="text-red-500 hover:bg-red-50 hover:text-red-600">
             Sign Out
           </Button>
        </div>
      </main>
    </div>
  );
}