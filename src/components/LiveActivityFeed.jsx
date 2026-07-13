import { useEffect, useState } from 'react';

const ACTIVITY = [
  { icon: '🎉', text: 'Michael K. just deposited', amount: 'UGX 50,000' },
  { icon: '💰', text: 'Sarah M. withdrew', amount: 'UGX 230,000' },
  { icon: '⭐', text: 'James O. reached', amount: 'VIP 4' },
  { icon: '🎁', text: 'Alice W. claimed', amount: "today's gift" },
  { icon: '🔥', text: 'Emmanuel B. just joined', amount: '' },
  { icon: '📈', text: 'David N. earned', amount: 'UGX 12,500' },
  { icon: '🏆', text: 'Grace L. upgraded to', amount: 'VIP 3' },
  { icon: '💸', text: 'Peter A. deposited', amount: 'UGX 100,000' },
  { icon: '🎉', text: 'Fatima H. just joined', amount: '' },
  { icon: '📈', text: 'Samuel T. earned', amount: 'UGX 8,000' },
  { icon: '💰', text: 'Amara D. withdrew', amount: 'UGX 450,000' },
  { icon: '⭐', text: 'Collins R. reached', amount: 'VIP 2' },
  { icon: '🔥', text: 'Blessing E. deposited', amount: 'UGX 75,000' },
  { icon: '🏆', text: 'Victor K. upgraded to', amount: 'VIP 5' },
  { icon: '💸', text: 'Miriam S. deposited', amount: 'UGX 250,000' },
  { icon: '🎁', text: 'Kwame J. claimed', amount: "today's gift" },
  { icon: '📈', text: 'Esther A. earned', amount: 'UGX 21,000' },
  { icon: '🎉', text: 'Daniel F. just joined', amount: '' },
  { icon: '💰', text: 'Nadia C. withdrew', amount: 'UGX 180,000' },
  { icon: '⭐', text: 'Ibrahim O. reached', amount: 'VIP 6' },
];

export default function LiveActivityFeed() {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout;
    const cycle = () => {
      const item = ACTIVITY[Math.floor(Math.random() * ACTIVITY.length)];
      setCurrent(item);
      setVisible(true);
      timeout = setTimeout(() => {
        setVisible(false);
        timeout = setTimeout(cycle, 1400);
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
        <p className="text-sm text-foreground/90">
          {current.text}{' '}
          {current.amount && <span className="font-semibold text-emerald-500">{current.amount}</span>}
        </p>
      </div>
    </div>
  );
}
