import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const GlassCard = forwardRef(function GlassCard(
  { className, children, glow = false, glowColor = 'emerald', hover = true, ...props },
  ref
) {
  const glowClass = glow
    ? glowColor === 'gold'
      ? 'glow-gold'
      : 'glow-emerald'
    : '';

  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('glass rounded-2xl p-5 relative overflow-hidden', glowClass, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export default GlassCard;