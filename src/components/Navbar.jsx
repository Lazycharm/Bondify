import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { isMuted, setMuted, playSound } from '@/lib/sound';
import MagneticButton from '@/components/ui/MagneticButton';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [muted, setMutedState] = useState(isMuted());

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSound('click');
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
        <div className="glass rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              B
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              Bondi<span className="text-emerald-500">fy</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#vip" className="hover:text-foreground transition-colors">VIP Levels</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:scale-105 transition-transform text-foreground"
              aria-label="Toggle sound"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={() => { toggle(); playSound('click'); }}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:scale-105 transition-transform text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <MagneticButton
              onClick={() => {}}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30"
            >
              <Link to="/register" className="text-white">Start Trading</Link>
            </MagneticButton>
          </div>
        </div>
      </div>
    </motion.header>
  );
}