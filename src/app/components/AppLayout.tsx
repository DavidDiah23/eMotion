import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Map, CircleDot, Users, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'maps', label: 'Maps', icon: Map, path: '/history' }, // using history for maps/routes for now
    { id: 'record', label: 'Record', icon: CircleDot, path: '/active-trek', isCenter: true },
    { id: 'groups', label: 'Groups', icon: Users, path: '/join' },
    { id: 'you', label: 'You', icon: User, path: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#121212] text-stone-900 dark:text-stone-50 font-opensans pb-20">
      
      {/* Main Content Area */}
      <Outlet />

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-[#1C1C1E] border-t border-stone-200 dark:border-stone-800 pb-safe z-[100]">
        <div className="flex justify-around items-center px-2 py-2 h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.path;
            
            if (item.isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center relative -top-3"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isActive ? 'bg-[#FF4500] ring-4 ring-[#FF4500]/20' : 'bg-stone-800 dark:bg-stone-700 text-white border-4 border-white dark:border-[#1C1C1E]'}`}>
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold mt-1 text-stone-500 dark:text-stone-400">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center min-w-[64px] transition-colors ${
                  isActive 
                    ? 'text-[#FF4500] dark:text-[#FF4500]' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
