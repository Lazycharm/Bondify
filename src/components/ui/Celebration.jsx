import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * Fires a confetti burst. Call imperatively.
 */
export function fireConfetti(opts = {}) {
  const defaults = {
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#f59e0b', '#22c55e', '#fbbf24'],
  };
  confetti({ ...defaults, ...opts });
}

/**
 * Full-screen celebration overlay with confetti + falling coins + message.
 */
export function CelebrationOverlay({ show, title, subtitle, onClose, autoDismiss = 3000 }) {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (show) {
      fireConfetti();
      import('@/lib/sound').then((m) => m.playSound('reward'));
      setCoins(
        Array.from({ length: 14 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random(),
        }))
      );
      if (autoDismiss) {
        const t = setTimeout(onClose, autoDismiss);
        return () => clearTimeout(t);
      }
    }
  }, [show, autoDismiss, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 backdrop-blur-md"
          onClick={onClose}
        >
          {coins.map((c) => (
            <motion.div
              key={c.id}
              initial={{ y: -50, x: `${c.left}vw`, opacity: 1, rotate: 0 }}
              animate={{ y: '100vh', opacity: 0, rotate: 360 }}
              transition={{ duration: c.duration, delay: c.delay, ease: 'easeIn' }}
              className="absolute text-3xl"
            >
              🪙
            </motion.div>
          ))}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="glass-strong rounded-3xl p-10 text-center max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-gradient-emerald mb-2">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}