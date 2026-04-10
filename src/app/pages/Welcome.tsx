import { Link } from 'react-router';
import { Button } from '../components/Button';
import { motion } from 'motion/react';

// Import your local background image
import bgImage from '../../assets/eMotion background image.png';

export function Welcome() {
  return (
    <div className="relative h-screen w-full flex flex-col justify-end bg-black text-white overflow-hidden">
      {/* Background Image */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 px-8 py-12 flex flex-col gap-8 max-w-md mx-auto w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold font-montserrat leading-tight mb-4">
            Discover Your <span className="text-[#FF4500]">Wild</span> Side
          </h1>
          <p className="text-stone-300 font-opensans text-lg leading-relaxed">
            Track your treks, explore new trails, and connect with nature confidently.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 w-full"
        >
          <Link to="/signup" className="w-full">
            <Button fullWidth size="lg">Get Started</Button>
          </Link>
          <Link to="/login" className="w-full">
            <Button variant="outline" fullWidth size="lg" className="border-white text-white hover:bg-white hover:text-black hover:border-white">
              I already have an account
            </Button>
          </Link>
        </motion.div>

        <p className="text-center text-xs text-stone-500 mt-4">
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}