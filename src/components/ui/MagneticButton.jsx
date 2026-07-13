import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Magnetic button that subtly follows the cursor and has a ripple effect on click.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.35,
  onClick,
  ripple = true,
  sound = 'click',
  ...props
}) {
  const ref = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
    setPos({ x, y });
  };

  const handleLeave = () => setPos({ x: 0, y: 0 });

  const handleClick = (e) => {
    const el = ref.current;
    if (!el) return;
    if (sound) {
      import('@/lib/sound').then((m) => m.playSound(sound));
    }
    if (ripple) {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = Date.now();
      setRipples((r) => [...r, { id, x, y, size }]);
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </motion.button>
  );
}