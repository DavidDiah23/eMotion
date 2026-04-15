import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { Card } from '../components/Card';
import { ChevronLeft, MapPin, Clock, Heart, Award, TriangleAlert, ChartBar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

const mockHistory = [
  {
    id: 1,
    title: 'Morning Karura Run',
    location: 'Nairobi, Kenya',
    date: 'Today at 6:30 AM',
    distance: '5.2 km',
    pace: '5:40 /km',
    time: '29m 32s',
    avgHr: '142 bpm',
    mapImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop',
    chartData: Array.from({length: 20}, (_, i) => ({ time: i, hr: 120 + Math.random() * 40 })),
    alerts: 0
  },
  {
    id: 2,
    title: 'Ngong Hills Hike',
    location: 'Kajiado, Kenya',
    date: 'Yesterday at 9:00 AM',
    distance: '12.4 km',
    pace: '8:15 /km',
    time: '2h 14m',
    avgHr: '115 bpm',
    mapImage: 'https://images.unsplash.com/photo-1473445730015-841f29a949ce?q=80&w=600&auto=format&fit=crop',
    chartData: Array.from({length: 20}, (_, i) => ({ time: i, hr: 90 + Math.random() * 30 })),
    alerts: 1
  }
];

export function History() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    treks: 42,
    distance: 312,
    alerts: 4
  });

  const [historyList, setHistoryList] = useState(mockHistory);

  useRealtimeSync({
    onAlertInserted: (alert) => {
      setMetrics(prev => ({ ...prev, alerts: prev.alerts + 1 }));
      setHistoryList(current => {
         const updated = [...current];
         if (updated.length > 0) {
            updated[0] = { ...updated[0], alerts: updated[0].alerts + 1 };
         }
         return updated;
      });
    },
    onTrekInserted: (trek) => {
      setMetrics(prev => ({ ...prev, treks: prev.treks + 1 }));
      setHistoryList(current => [
         {
           id: current.length > 0 ? Math.max(...current.map(h => h.id)) + 1 : 1,
           title: 'Live Trek Session',
           location: 'Syncing Location...',
           date: 'Just started',
           distance: '0.0 km',
           pace: '-- /km',
           time: '0m',
           avgHr: '-- bpm',
           mapImage: 'https://images.unsplash.com/photo-1473445730015-841f29a949ce?q=80&w=600&auto=format&fit=crop',
           chartData: Array.from({length: 5}, (_, i) => ({ time: i, hr: 80 })),
           alerts: 0
         },
         ...current
      ]);
    }
  });

  return (
    <div className="min-h-screen bg-stone-100 font-opensans pb-20">
      <header className="bg-[#2E4F2F] text-white px-4 py-4 flex items-center justify-center shadow-md sticky top-0 z-50">
        <h1 className="font-montserrat font-bold text-lg">Activity History</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex gap-4">
          <div className="flex-1 text-center border-r border-stone-100">
            <div className="text-2xl font-bold font-montserrat text-[#2E4F2F]">{metrics.treks}</div>
            <div className="text-xs uppercase font-bold text-stone-400">Total Treks</div>
          </div>
          <div className="flex-1 text-center border-r border-stone-100">
            <div className="text-2xl font-bold font-montserrat text-[#2E4F2F]">{metrics.distance}</div>
            <div className="text-xs uppercase font-bold text-stone-400">Distance (km)</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold font-montserrat text-[#2E4F2F] transition-all duration-300">{metrics.alerts}</div>
            <div className="text-xs uppercase font-bold text-stone-400">Alerts Logs</div>
          </div>
        </div>

        {historyList.map((activity) => (
          <Card key={activity.id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden shrink-0 border-2 border-stone-100 mt-1">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold font-montserrat text-stone-800 text-lg leading-tight">{activity.title}</h3>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">{activity.date}</p>
                  </div>
                  {activity.alerts > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      <TriangleAlert className="w-3 h-3" /> {activity.alerts} Alert
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 pb-3 flex items-center gap-1 text-stone-500 text-sm font-medium">
              <MapPin className="w-4 h-4" /> {activity.location}
            </div>

            <div className="h-48 w-full relative">
              <img src={activity.mapImage} alt="Map Route" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-stone-900/10" />
            </div>

            <div className="p-4 bg-white">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-stone-500 uppercase font-bold mb-1">Distance</div>
                  <div className="font-montserrat font-bold text-xl">{activity.distance}</div>
                </div>
                <div className="border-l pl-4 border-stone-100">
                  <div className="text-xs text-stone-500 uppercase font-bold mb-1">Pace</div>
                  <div className="font-montserrat font-bold text-xl">{activity.pace}</div>
                </div>
                <div className="border-l pl-4 border-stone-100">
                  <div className="text-xs text-stone-500 uppercase font-bold mb-1">Time</div>
                  <div className="font-montserrat font-bold text-xl">{activity.time}</div>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-3 flex gap-4 mt-2">
                <div className="w-1/3">
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-bold uppercase mb-1">
                    <Heart className="w-3 h-3 text-red-500" /> Avg HR
                  </div>
                  <div className="font-bold text-lg font-montserrat">{activity.avgHr}</div>
                </div>
                <div className="flex-1 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activity.chartData}>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
}
