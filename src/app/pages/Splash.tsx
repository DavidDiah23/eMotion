import { motion } from 'motion/react';
import { Mountain } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to Welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#2E4F2F] text-white overflow-hidden relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 z-10"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
        >
          <Mountain className="w-24 h-24 text-[#FF4500]" strokeWidth={1.5} />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-5xl font-bold font-montserrat tracking-tight"
        >
          eMotion
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-lg text-stone-300 font-opensans tracking-wide text-center px-8"
        >
          Your Adventure & Trekking Companion
        </motion.p>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#3E6B3F] rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#FF4500] rounded-full blur-3xl opacity-20" />
    </div>
  );
}
