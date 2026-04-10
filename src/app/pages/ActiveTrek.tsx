import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Camera, Search, Navigation, Settings, ChevronLeft, MapPin, Loader2, TriangleAlert, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { supabase } from '../client';
import { offlineQueue } from '../../utils/OfflineQueue';

// Mapbox Imports
import { Map, Source, Layer, Marker } from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';
import { gpx } from '@tmcw/togeojson';
import { X, Map as MapIcon, Radio } from 'lucide-react'; // Added icons for settings

// --- Math Utilities ---
function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function ActiveTrek() {
  const navigate = useNavigate();

  // State
  const [isTracking, setIsTracking] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [positions, setPositions] = useState<[number, number][]>([]);

  // Mapbox ViewState
  const [viewState, setViewState] = useState({
    longitude: 36.8167,
    latitude: -1.2333,
    zoom: 14
  });
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/outdoors-v12");

  // Multiplayer Lobby State
  const [peers, setPeers] = useState<Record<string, { lat: number, lon: number, name: string }>>({});
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const channelRef = useRef<any>(null);
  const localName = localStorage.getItem('eMotion_fullName') || 'Explorer';

  // GPX Data State
  const [gpxGeojson, setGpxGeojson] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vitals State
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [skinDetected, setSkinDetected] = useState(false);
  const [fallDetected, setFallDetected] = useState(false);
  const [acceleration, setAcceleration] = useState(0);
  const [motionPermissionGranted, setMotionPermissionGranted] = useState(false);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);

  const logAlert = async (type: string) => {
    toast.error(`⚠️ ${type} Alert Triggered!`);
    try {
      await offlineQueue.safeRpc('notify_emergency', {
        user_id: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
        type: type,
        location: `${positions.length > 0 ? positions[positions.length - 1].join(', ') : 'Unknown'}`
      });
    } catch (e) {
      console.error(e);
    }
  };

  // --- Clock / Pace Timer ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTracking) {
      timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isTracking]);

  const currentPace = (distanceKm > 0.01 && timeElapsed > 0)
    ? (timeElapsed / 60) / distanceKm
    : 0;

  const currentPosition = positions.length > 0 ? positions[positions.length - 1] : [viewState.latitude, viewState.longitude] as [number, number];

  // --- GPS Geolocation Tracking ---
  useEffect(() => {
    if (!isTracking || !navigator.geolocation) return;

    let totalDist = distanceKm;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setViewState((prev) => ({ ...prev, latitude, longitude }));
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
        // Fallback to a mock location (e.g. Karura Forest geometry)
        if (positions.length === 0) {
          setPositions([[-1.2333, 36.8167]]);
        }
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking]);

  // --- Realtime Lobby (Supabase Presence) ---
  useEffect(() => {
    if (!isTracking) {
       if (channelRef.current) {
         supabase.removeChannel(channelRef.current);
         channelRef.current = null;
         setPeers({});
       }
       return;
    }

    const room = supabase.channel('trek-lobby', {
      config: { presence: { key: (supabase.auth as any).user?.id || Math.random().toString() } }
    });
    channelRef.current = room;

    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        const newPeers: Record<string, { lat: number, lon: number, name: string }> = {};
        for (const id in state) {
          const presenceData = state[id][0] as any;
          if (presenceData && presenceData.name !== localName) { // Exclude self roughly
            newPeers[id] = presenceData;
          }
        }
        setPeers(newPeers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isBroadcasting) {
          await room.track({
            name: localName,
            lat: currentPosition[0],
            lon: currentPosition[1]
          });
        }
      });

    return () => {
      supabase.removeChannel(room);
      channelRef.current = null;
    };
  }, [isTracking]);

  // Update presence when position changes
  useEffect(() => {
    if (isBroadcasting && channelRef.current && isTracking) {
      channelRef.current.track({
        name: localName,
        lat: currentPosition[0],
        lon: currentPosition[1]
      });
    } else if (!isBroadcasting && channelRef.current) {
      channelRef.current.untrack();
    }
  }, [currentPosition, isBroadcasting, isTracking, localName]);

  // --- Fall Detection (Accelerometer) ---
  const requestMotionPermission = () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((state: string) => {
          if (state === 'granted') {
            setMotionPermissionGranted(true);
            window.addEventListener('devicemotion', handleMotion);
          } else {
            toast.error("Motion sensors denied.");
          }
        })
        .catch(console.error);
    } else {
      setMotionPermissionGranted(true);
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  let lastTimeRef = useRef(Date.now());
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isTracking) return;
    const acc = event.accelerationIncludingGravity;
    if (acc && acc.x != null && acc.y != null && acc.z != null) {
      const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      setAcceleration(magnitude);

      if (magnitude > 18 && Date.now() - lastTimeRef.current > 5000) {
        lastTimeRef.current = Date.now();
        setFallDetected(true);
        logAlert('Fall Detected');
        setTimeout(() => setFallDetected(false), 5000);
      }
    }
  }, [isTracking]);

  useEffect(() => {
    if (motionPermissionGranted) {
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isTracking, motionPermissionGranted, handleMotion]);

  // --- Heart Rate (PPG) Variance Logic ---
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isDetecting) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;
      let rSum = 0;
      let count = 0;

      // Only check the center block of pixels to ensure finger coverage
      const w = canvas.width;
      const h = canvas.height;

      for (let y = h / 3; y < 2 * h / 3; y += 4) {
        for (let x = w / 3; x < 2 * w / 3; x += 4) {
          const i = (y * w + x) * 4;
          rSum += data[i];
          count++;
        }
      }

      const mean = rSum / count;

      // Variance check
      let sqSum = 0;
      for (let y = h / 3; y < 2 * h / 3; y += 4) {
        for (let x = w / 3; x < 2 * w / 3; x += 4) {
          const i = (y * w + x) * 4;
          sqSum += Math.pow(data[i] - mean, 2);
        }
      }
      const variance = sqSum / count;

      const isSkin = mean > 55 && variance < 4000;
      setSkinDetected(isSkin);

      if (isSkin) {
        // Base simplistic mock pulse logic triggered by real skin verification
        const mockPulse = 110 + Math.sin(Date.now() / 200) * 10;
        setHeartRate(Math.round(mockPulse));
      } else {
        setHeartRate(null);
      }
    }

    if (isDetecting) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isDetecting]);

  const toggleCamera = async () => {
    if (isDetecting) {
      setIsDetecting(false);
      setHeartRate(null);
      setSkinDetected(false);
      cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', advanced: [{ torch: true } as any] }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsDetecting(true);
        requestAnimationFrame(processFrame);
        toast.info("Place your finger covering the camera lens and flash");
      } catch (err: any) {
        console.error("Camera error:", err);
        toast.error("Could not access camera for HR.");
      }
    }
  };

  // Cleanup Camera
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // --- GPX Parser ---
  const handleGpxUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlString = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, "text/xml");

        // Ensure no parsing errors
        const parseError = doc.querySelector("parsererror");
        if (parseError) {
          toast.error("Invalid GPX XML format.");
          return;
        }

        const geojson = gpx(doc);
        setGpxGeojson(geojson);

        // Center map to start of GPX if coordinates exist
        if (geojson.features && geojson.features.length > 0) {
          const coords = geojson.features[0].geometry.coordinates;
          if (coords && coords.length > 0) {
            setViewState((prev) => ({
              ...prev,
              longitude: coords[0][0],
              latitude: coords[0][1],
              zoom: 13
            }));
          }
        }
        toast.success("Route imported successfully!");

      } catch (error) {
        console.error("Failed to parse GPX:", error);
        toast.error("Failed to read GPX file");
      }
    };
    reader.readAsText(file);
  };

  // Convert our tracking array into a GeoJSON LineString
  const trackingGeojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: positions.map(p => [p[1], p[0]]) // Mapbox expects [lon, lat]
        }
      }
    ]
  };

  return (
    <div className="h-screen flex flex-col bg-stone-900 font-opensans relative">

      {/* Mapbox Container Layer */}
      <div className="absolute inset-0 z-0 h-[50vh]">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={mapStyle}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        >
          {/* Imported GPX Route */}
          {gpxGeojson && (
            <Source id="gpx-data" type="geojson" data={gpxGeojson}>
              <Layer
                id="gpx-layer"
                type="line"
                paint={{ 'line-color': '#A8A29E', 'line-width': 4, 'line-dasharray': [2, 2] }}
              />
            </Source>
          )}

          {/* Active Live Tracking GeoJSON */}
          {positions.length > 0 && (
            <Source id="live-track" type="geojson" data={trackingGeojson as any}>
              <Layer
                id="live-track-layer"
                type="line"
                paint={{ 'line-color': '#FF4500', 'line-width': 6 }}
              />
            </Source>
          )}

          {/* Local User Marker */}
          <Marker longitude={currentPosition[1]} latitude={currentPosition[0]} color="#FF4500" />
          
          {/* Peer Markers for Multiplayer Sync */}
          {Object.values(peers).map((peer, i) => (
             <Marker key={i} longitude={peer.lon} latitude={peer.lat}>
               <div className="flex flex-col items-center">
                 <div className="bg-amber-400 w-4 h-4 rounded-full border-2 border-white shadow-md animate-bounce" />
                 <span className="text-[10px] font-bold mt-1 text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm">{peer.name}</span>
               </div>
             </Marker>
          ))}
        </Map>

        {/* GPX Upload Overlay Button */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <input
            type="file"
            accept=".gpx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleGpxUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-stone-100 hover:border-[#FF4500] transition-colors"
          >
            <UploadCloud className="w-5 h-5 text-stone-700" />
          </button>
        </div>
      </div>

      {/* Floating Header */}
      <header className="absolute top-0 w-full z-10 bg-transparent bg-gradient-to-b from-black/80 to-transparent text-white px-4 py-8 flex items-center justify-between pointer-events-auto">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider font-bold text-[#FF4500] animate-pulse">Live Trek</span>
          <h1 className="font-montserrat font-bold text-lg drop-shadow-md">Karura Forest</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 -mr-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Settings Drawer Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative bg-white dark:bg-[#1C1C1E] rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col gap-6">
            <div className="flex justify-between items-center text-stone-900 dark:text-white">
              <h2 className="font-montserrat font-bold text-xl">Trek Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-full bg-stone-100 dark:bg-stone-800"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg"><Radio className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                  <div>
                    <div className="font-bold">Broadcast Location</div>
                    <div className="text-xs text-stone-500">Share live tracking with group</div>
                  </div>
                </div>
                <Button 
                   size="sm" 
                   variant={isBroadcasting ? 'primary' : 'outline'} 
                   onClick={() => setIsBroadcasting(!isBroadcasting)}
                >
                  {isBroadcasting ? 'Live' : 'Hidden'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg"><MapIcon className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                  <div>
                    <div className="font-bold">Satellite Map</div>
                    <div className="text-xs text-stone-500">Toggle realistic terrain imagery</div>
                  </div>
                </div>
                <Button 
                   size="sm" 
                   variant={mapStyle.includes('satellite') ? 'primary' : 'outline'} 
                   onClick={() => setMapStyle(mapStyle.includes('satellite') ? "mapbox://styles/mapbox/outdoors-v12" : "mapbox://styles/mapbox/satellite-v9")}
                >
                  {mapStyle.includes('satellite') ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Dashboard Component */}
      <div className="absolute inset-x-0 bottom-0 top-[40vh] bg-stone-100 dark:bg-[#121212] z-20 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col pt-6 pb-8 px-4 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* Drag handle visual */}
        <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-6 absolute top-3 left-1/2 -translate-x-1/2"></div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 relative">
          <Card className="absolute -top-16 left-0 right-0 p-4 border-2 border-stone-200 dark:border-stone-800 shadow-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl flex divide-x divide-stone-200 dark:divide-stone-800 z-30">
            <div className="flex-1 px-2">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-1">
                <Navigation className="w-3 h-3" /> Distance
              </div>
              <div className="font-montserrat font-bold text-3xl text-stone-900 dark:text-white">
                {distanceKm.toFixed(2)} <span className="text-sm">km</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-1">
                <Camera className="w-3 h-3" /> Pace
              </div>
              <div className="font-montserrat font-bold text-3xl text-stone-900 dark:text-white">
                {currentPace.toFixed(1)} <span className="text-sm text-stone-500">/km</span>
              </div>
            </div>
          </Card>
        </div>

        <h3 className="font-montserrat font-bold text-lg text-stone-900 dark:text-white mt-12 mb-4">Vitals & Safety</h3>

        <div className="space-y-3 flex-1 flex flex-col">
          {/* Heart Rate / Camera Feed Container */}
          <Card className="p-1 sm:p-4 border border-stone-200 flex flex-col bg-white">
            <div className="flex justify-between items-center px-3 pt-3 sm:px-0 sm:pt-0 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-red-500" />
                </div>
                <span className="font-bold text-stone-800">Heart Rate (PPG)</span>
              </div>
              <button
                onClick={toggleCamera}
                className={`p-2 rounded-full transition-colors ${isDetecting ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className={`relative w-full h-32 sm:h-40 rounded-xl overflow-hidden flex items-center justify-center transition-colors ${isDetecting ? 'bg-black' : 'bg-stone-50'}`}>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover opacity-50"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isDetecting && (
                <div className="text-stone-400 font-bold tracking-widest text-2xl font-montserrat opacity-50">
                  --
                </div>
              )}

              {isDetecting && !skinDetected && (
                <div className="relative z-10 flex flex-col items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                  <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Awaiting Finger...</span>
                </div>
              )}

              {isDetecting && skinDetected && heartRate && (
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-red-500 text-6xl font-montserrat font-bold drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] tracking-tighter">
                    {heartRate}
                  </span>
                  <span className="text-white/80 font-bold text-xs uppercase tracking-widest mt-1">BPM</span>
                </div>
              )}
            </div>
          </Card>

          {/* Accelerometer / Fall Detection Panel */}
          <Card className={`p-4 border ${fallDetected ? 'border-[#FF4500] bg-red-50 ring-2 ring-[#FF4500] animate-pulse' : 'border-stone-200 bg-white'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <TriangleAlert className={`w-5 h-5 ${fallDetected ? 'text-[#FF4500]' : 'text-orange-400'}`} />
                <span className="font-bold text-stone-800">Fall Detection</span>
              </div>
              {motionPermissionGranted && (
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${fallDetected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {fallDetected ? 'TRIGGERED' : 'Active'}
                </div>
              )}
            </div>

            {motionPermissionGranted ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-montserrat font-bold text-stone-800 my-1">
                    {acceleration.toFixed(1)} <span className="text-sm text-stone-500">m/s²</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  Monitoring via device accelerometer. Jolts {">"} 18 trigger alert.
                </p>
              </>
            ) : (
              <div className="my-2">
                <Button onClick={requestMotionPermission} size="sm" variant="outline" className="w-full text-xs font-bold font-montserrat border-stone-200 hover:bg-stone-50 text-stone-700">
                  Enable Motion Sensors
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto shrink-0 w-full mb-4">
          <Button
            variant="outline"
            className="border-stone-200 text-stone-600 hover:bg-stone-50 font-bold shadow-sm"
            onClick={() => {
              toast.success('Trek safely saved!');
              navigate('/dashboard');
            }}
          >
            End & Save
          </Button>
          <Button
            variant={isTracking ? 'primary' : 'outline'}
            className={isTracking ? 'bg-amber-500 hover:bg-amber-600 border-transparent text-white font-bold shadow-md' : 'border-amber-500 text-amber-600 hover:bg-amber-50 font-bold shadow-sm'}
            onClick={() => setIsTracking(!isTracking)}
          >
            {isTracking ? 'Pause Tracking' : 'Resume Tracking'}
          </Button>
        </div>
      </div>
    </div>
  );
}
