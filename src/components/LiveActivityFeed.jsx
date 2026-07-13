import { useEffect, useState } from 'react';

const SAMPLE_ACTIVITY = [
  { icon: '🎉', text: 'Michael invested', amount: 'UGX 50,000' },
  { icon: '💰', text: 'Sarah withdrew', amount: 'UGX 230,000' },
  { icon: '⭐', text: 'James reached', amount: 'VIP4' },
  { icon: '🎁', text: 'Alice claimed', amount: 'today\'s gift' },
  { icon: '🔥', text: 'New member joined', amount: '' },
  { icon: '📈', text: 'David earned', amount: 'UGX 12,500' },
  { icon: '🏆', text: 'Grace upgraded to', amount: 'VIP3' },
  { icon: '💸', text: 'Peter deposited', amount: 'UGX 100,000' },
];

/**
 * Floating live activity notifications that slide in, pause, then fade.
 * Clearly labelled as sample activity in demo mode.
 */
export default function LiveActivityFeed({ demo = true }) {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout;
    const cycle = () => {
      const item = SAMPLE_ACTIVITY[Math.floor(Math.random() * SAMPLE_ACTIVITY.length)];
      setCurrent(item);
      setVisible(true);
      timeout = setTimeout(() => {
        setVisible(false);
        timeout = setTimeout(cycle, 1200);
      }, 4000);
    };
    const initial = setTimeout(cycle, 2000);
    return () => clearTimeout(timeout || initial);
  }, []);

  if (!current) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 max-w-xs shadow-2xl">
        <span className="text-2xl">{current.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/90">
            {current.text}{' '}
            <span className="font-semibold text-emerald-500">{current.amount}</span>
          </p>
          {demo && (
            <p className="text-[10px] text-muted-foreground mt-0.5">Sample activity</p>
          )}
        </div>
      </div>
    </div>
  );
}