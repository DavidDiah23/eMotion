import { useState, useEffect } from 'react';
import { 
  Bell, 
  MapPin, 
  Mountain, 
  Clock, 
  Activity, 
  Play, 
  Users, 
  History, 
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { supabase } from '../client';
import { useNavigate } from 'react-router';

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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/login');
      } else {
        setUser(user);
      }
    });
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-opensans text-stone-800">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#2E4F2F] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3" onClick={() => navigate('/profile-setup')}>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <span className="font-semibold text-sm hidden sm:block truncate max-w-[100px]">
            {user?.user_metadata?.full_name?.split(' ')[0] || 'Explorer'}
          </span>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <Mountain className="w-6 h-6 text-[#FF4500]" strokeWidth={2} />
          <h1 className="text-xl font-bold font-montserrat tracking-tight">eMotion</h1>
        </div>

        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4500] rounded-full ring-2 ring-[#2E4F2F]" />
        </button>
      </header>

      <main className="px-6 py-6 space-y-8 max-w-4xl mx-auto">
        {/* Active Trek Card */}
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
                <h3 className="text-2xl font-bold font-montserrat text-stone-900">Mt. Rainier Trail</h3>
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Washington, USA</span>
                </div>
              </div>
              <div className="bg-stone-100 p-3 rounded-lg flex flex-col items-center">
                <Clock className="w-5 h-5 text-[#FF4500] mb-1" />
                <span className="font-mono font-bold text-stone-800">02:45</span>
                <span className="text-[10px] uppercase text-stone-400 font-bold">Duration</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-stone-100 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold font-montserrat text-stone-800">4.2</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide font-bold">km</div>
              </div>
              <div className="text-center border-l border-stone-200">
                <div className="text-2xl font-bold font-montserrat text-stone-800">320</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide font-bold">m</div>
              </div>
              <div className="text-center border-l border-stone-200">
                <div className="text-2xl font-bold font-montserrat text-stone-800">142</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide font-bold">bpm</div>
              </div>
            </div>

            <Button fullWidth className="mt-6 font-bold" onClick={() => toast('Opening Map...')}>
              View Live Map <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </section>

        {/* Stats Overview */}
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
                  <defs>
                    <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E4F2F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2E4F2F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#2E4F2F', fontWeight: 'bold' }}
                    cursor={{ stroke: '#FF4500', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="dist" 
                    stroke="#2E4F2F" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorDist)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold font-montserrat text-[#2E4F2F] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-stone-100 hover:shadow-lg active:scale-95 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF4500] transition-colors">
                <Play className="w-6 h-6 text-[#FF4500] group-hover:text-white transition-colors ml-1" />
              </div>
              <span className="font-bold text-sm text-stone-700">Start Trek</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-stone-100 hover:shadow-lg active:scale-95 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#2E4F2F]/10 flex items-center justify-center mb-3 group-hover:bg-[#2E4F2F] transition-colors">
                <Users className="w-6 h-6 text-[#2E4F2F] group-hover:text-white transition-colors" />
              </div>
              <span className="font-bold text-sm text-stone-700">Join Trek</span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-stone-100 hover:shadow-lg active:scale-95 transition-all group sm:col-span-1 col-span-2">
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
