import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Users, Search, MapPin, Navigation } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

const mockLobbies = [
  { id: 1, name: 'Karura Morning Pack', host: 'Sarah M.', count: 4, distance: '1.2 km away' },
  { id: 2, name: 'Ngong Extreme', host: 'David D.', count: 2, distance: '8.5 km away' },
  { id: 3, name: 'Oloolua Nature Walk', host: 'Jane K.', count: 8, distance: '12 km away' }
];

export function JoinTrek() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#121212] dark:text-[#E0E0E0] font-opensans flex flex-col pb-20">
      <header className="bg-[#2E4F2F] text-white px-4 py-4 flex items-center justify-center shadow-md z-50">
        <h1 className="font-montserrat font-bold text-lg">Join a Trek</h1>
      </header>

      {/* Decorative Map Background Header */}
      <div className="relative h-48 w-full bg-stone-200 shrink-0">
        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" alt="Map" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-50 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6 flex justify-center">
          <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border-2 border-[#2E4F2F] flex items-center gap-3 w-full max-w-sm">
            <Search className="w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search locations or groups..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-stone-800 placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 z-10 -mt-2 space-y-8 overflow-y-auto w-full max-w-md mx-auto">
        
        {/* Quick Pin Join */}
        <section>
          <h2 className="text-sm font-bold font-montserrat text-stone-400 uppercase tracking-wider mb-4">Have an invite pin?</h2>
          <Card className="p-4 bg-white border border-stone-200 flex gap-3 shadow-sm">
            <Input 
              placeholder="Enter 6-Digit PIN" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="font-bold tracking-widest text-center"
              maxLength={6}
            />
            <Button disabled={pin.length !== 6} onClick={() => navigate('/active')} className="px-6 shrink-0 bg-[#FF4500] hover:bg-[#E03E00]">
              Join
            </Button>
          </Card>
        </section>

        {/* Nearby Active Lobbies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold font-montserrat text-stone-400 uppercase tracking-wider">Nearby Active Treks</h2>
            <Navigation className="w-4 h-4 text-stone-400" />
          </div>

          <div className="space-y-3">
            {mockLobbies.map((lobby) => (
              <Card key={lobby.id} className="p-4 bg-white border border-stone-200 hover:border-[#2E4F2F] transition-colors cursor-pointer group active:scale-[0.98]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold font-montserrat text-stone-800 group-hover:text-[#2E4F2F] transition-colors">{lobby.name}</h3>
                  <div className="bg-stone-100 px-2 py-1 rounded text-xs font-bold text-stone-600 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {lobby.count}/10
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-stone-500 font-medium">
                  <span>Host: {lobby.host}</span>
                  <div className="flex items-center gap-1 text-[#FF4500]">
                    <MapPin className="w-3 h-3" /> {lobby.distance}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
