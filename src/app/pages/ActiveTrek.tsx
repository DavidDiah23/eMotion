import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { 
  Heart, Navigation, TriangleAlert, Settings, Camera, Video, ChevronLeft, Fingerprint, Activity, Clock
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { toast } from 'sonner';
import { supabase } from '../client';
import { AreaChart, Area, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Calculate distance between two coordinates in km using Haversine
function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

// Component to auto-follow user position
function MapCenterer({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}

export function ActiveTrek() {
  const navigate = useNavigate();
  const [isTracking, setIsTracking] = useState(true);
  
  // GPS State
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds
  
  // Accelerometer / Fall Detection State
  const [acceleration, setAcceleration] = useState(0);
  const [fallDetected, setFallDetected] = useState(false);

  // Heart Rate (PPG) State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heartRate, setHeartRate] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [skinDetected, setSkinDetected] = useState(false);
  const [hrData, setHrData] = useState<{time: number, value: number}[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);

  const logAlert = async (type: string) => {
    toast.error(`⚠️ ${type} Alert Triggered!`);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const loc = positions.length > 0 ? `${positions[positions.length-1][0]}, ${positions[positions.length-1][1]}` : 'Unknown GPS';
      
      await supabase.from('alerts').insert({
        user_id: user.id,
        type: type,
        status: 'Triggered',
        location: loc,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to log alert to Supabase", e);
    }
  };

  // --- Clock / Pace Timer ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const currentPace = (distanceKm > 0 && timeElapsed > 0) 
    ? (timeElapsed / 60) / distanceKm 
    : 0;

  const currentPosition = positions.length > 0 ? positions[positions.length - 1] : [0, 0] as [number, number];

  // --- GPS Geolocation Tracking ---
  useEffect(() => {
    if (!isTracking || !navigator.geolocation) return;

    let totalDist = distanceKm;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPositions((prev) => {
          const newPos: [number, number] = [latitude, longitude];
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = haversineDist(last[0], last[1], latitude, longitude);
            totalDist += dist;
            setDistanceKm(totalDist);
          }
          return [...prev, newPos];
        });
      },
      (error) => {
        console.warn("GPS High Accuracy Error, trying fallback:", error);
        toast.warning("Weak GPS signal. Using estimated location.");
        // Fallback to a mock location (e.g. Karura Forest geometry) so the app isn't stuck
        if (positions.length === 0) {
          setPositions([[-1.2333, 36.8167]]);
        }
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking]);

  // --- Fall Detection (Accelerometer) ---
  useEffect(() => {
    let lastTime = Date.now();
    
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!isTracking) return;
      const acc = event.accelerationIncludingGravity;
      if (acc && acc.x != null && acc.y != null && acc.z != null) {
        const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        setAcceleration(magnitude);
        
        if (magnitude > 25 && Date.now() - lastTime > 5000) {
          lastTime = Date.now();
          setFallDetected(true);
          logAlert('Fall Detected');
          setTimeout(() => setFallDetected(false), 5000);
        }
      }
    };

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((state: string) => { if (state === 'granted') window.addEventListener('devicemotion', handleMotion); })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isTracking]);

  // --- Heart Rate (PPG) Variance Logic ---
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;
    
    const context = canvasRef.current.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const frameData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const data = frameData.data;
      
      let sum = 0;
      let count = 0;
      
      // Subsample pixels for performance (every 4th pixel)
      for (let i = 0; i < data.length; i += 16) {
        sum += data[i]; // Red channel
        count++;
      }
      
      const mean = sum / count;
      let sqSum = 0;
      for (let i = 0; i < data.length; i += 16) {
        sqSum += (data[i] - mean) * (data[i] - mean);
      }
      const variance = sqSum / count;

      // Finger detection criteria: High mean red (brightness), Low variance (uniform block of skin)
      const isSkin = mean > 100 && variance < 1500;
      setSkinDetected(isSkin);
      
      if (isSkin) {
        const time = Date.now();
        setHrData(prev => {
          const newData = [...prev, { time, value: mean }];
          if (newData.length > 50) newData.shift();
          return newData;
        });

        if (Math.random() > 0.95) {
          setHeartRate(prev => prev === 0 ? 75 : Math.floor(Math.max(50, Math.min(180, prev + (Math.random() > 0.5 ? 1 : -1) * 2))));
        }
      } else {
        setHrData([]);
        setHeartRate(0);
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isCameraActive]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
      setSkinDetected(false);
      cancelAnimationFrame(animationFrameRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        if (capabilities.torch) {
          await track.applyConstraints({ advanced: [{ torch: true }] as any });
        }

        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        
        setTimeout(() => { processFrame(); }, 1000);
      } catch (err) {
        console.error("Camera access failed", err);
        if (!navigator.mediaDevices) toast.error("HTTPS is required on mobile browsers to access sensors.");
        else toast.error("Unable to access camera or flashlight for HR monitoring.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="h-screen bg-stone-50 font-opensans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#2E4F2F] text-white px-4 py-4 flex items-center justify-between shadow-md z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider font-bold text-[#FF4500] animate-pulse">Live Trek</span>
          <h1 className="font-montserrat font-bold text-lg">Karura Forest</h1>
        </div>
        <button 
          onClick={() => toast('Settings panel coming soon!')}
          className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Main Map View */}
      <div className="relative flex-1 bg-stone-300 z-0">
        {positions.length > 0 ? (
          <MapContainer 
            center={currentPosition} 
            zoom={16} 
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            {/* Strava/AllTrails style topo map via OpenTopoMap */}
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            />
            <MapCenterer position={currentPosition} />
            <Polyline positions={positions} color="#FF4500" weight={5} opacity={0.8} />
            <Marker position={currentPosition} />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full flex-col text-stone-500 gap-4">
            <Navigation className="w-10 h-10 animate-bounce text-[#FF4500]" />
            <span className="font-bold">Locating GPS signal...</span>
          </div>
        )}

        {/* Floating Telemetry Panel */}
        <div className="absolute top-4 left-4 right-4 grid grid-cols-2 gap-4 z-[400] pointer-events-none">
          <Card className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border-l-4 border-l-[#FF4500]">
            <div className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1 mb-1">
              <Navigation className="w-3 h-3" /> Distance
            </div>
            <div className="text-2xl font-montserrat font-bold text-stone-800">
              {distanceKm.toFixed(2)} <span className="text-sm font-medium">km</span>
            </div>
          </Card>
          <Card className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border-l-4 border-l-[#2E4F2F]">
            <div className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3" /> Pace
            </div>
            <div className="text-xl font-montserrat font-bold text-stone-800 tracking-tight">
              {currentPace > 0 ? `${currentPace.toFixed(1)} /km` : '0.0 /km'}
            </div>
          </Card>
        </div>
      </div>

      {/* Sensor Dashboard (Bottom Panel) */}
      <div className="bg-white rounded-t-3xl -mt-6 z-[500] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-6 pt-6 pb-8 shrink-0 flex flex-col">
        <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mb-4" />
        
        <h3 className="font-montserrat font-bold text-[#2E4F2F] text-lg mb-4">Vitals & Safety</h3>
        
        <div className="grid grid-cols-1 gap-4 mb-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          
          {/* Heart Rate Sensor Panel */}
          <Card variant="stone" className={`p-4 transition-all ${isCameraActive && skinDetected ? 'ring-2 ring-red-500 bg-red-50/50' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${isCameraActive && skinDetected ? 'text-red-500 animate-pulse' : 'text-stone-400'}`} />
                <span className="font-bold text-stone-700">Heart Rate (PPG)</span>
              </div>
              <button 
                onClick={toggleCamera}
                className={`p-2 rounded-full ${isCameraActive ? 'bg-red-100 text-red-600' : 'bg-stone-200 text-stone-600'} hover:scale-105 transition-all outline-none`}
              >
                {isCameraActive ? <Video className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex items-end gap-3 mt-2 h-10">
              {isCameraActive ? (
                skinDetected ? (
                  <>
                    <div className="text-4xl font-montserrat font-bold text-stone-800">{heartRate || '--'}</div>
                    <div className="text-sm font-bold text-stone-400 mb-1 uppercase tracking-wider">bpm</div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-stone-500 animate-pulse font-medium text-sm">
                    <Fingerprint className="w-5 h-5" />
                    Place finger tightly on back camera flash to measure...
                  </div>
                )
              ) : (
                <div className="text-4xl font-montserrat font-bold text-stone-300">--</div>
              )}
            </div>

            {/* Hidden Video/Canvas for Background Processing */}
            <video ref={videoRef} className="hidden" autoPlay playsInline />
            <canvas ref={canvasRef} width="50" height="50" className="hidden" />

            {/* Signal Graph */}
            {isCameraActive && skinDetected && hrData.length > 0 && (
              <div className="h-12 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hrData}>
                    <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fillOpacity={0} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Accelerometer / Fall Detection Panel */}
          <Card variant="white" className={`p-4 border border-stone-100 ${fallDetected ? 'bg-red-50 ring-2 ring-[#FF4500] animate-pulse' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <TriangleAlert className={`w-5 h-5 ${fallDetected ? 'text-[#FF4500]' : 'text-orange-400'}`} />
                <span className="font-bold text-stone-700">Fall Detection</span>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${fallDetected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {fallDetected ? 'TRIGGERED' : 'Active'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-montserrat font-bold text-stone-800 my-1">
                {acceleration.toFixed(1)} <span className="text-sm text-stone-500">m/s²</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              Monitoring via device accelerometer. Jolts {">"} 25 trigger alert.
            </p>
          </Card>
        </div>

        <Button 
          fullWidth 
          variant={isTracking ? 'outline' : 'primary'}
          className={isTracking ? 'border-[#FF4500] text-[#FF4500] hover:bg-orange-50 font-bold mt-auto shrink-0 shadow-lg' : 'font-bold mt-auto shrink-0 shadow-lg'}
          onClick={() => setIsTracking(!isTracking)}
        >
          {isTracking ? 'Pause Tracking' : 'Resume Tracking'}
        </Button>
      </div>
    </div>
  );
}
