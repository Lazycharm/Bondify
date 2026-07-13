import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, PenLine, Check, Building2, User, Phone } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { formatUGX } from '@/lib/vipData';

function getSaleData() {
  try {
    const raw = localStorage.getItem('bondify_sale_data');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

const CONTRACT_DATE = new Date().toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' });

export default function SalesContract() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sale = getSaleData();

  const [phone, setPhone] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [sigProgress, setSigProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sale) navigate('/dashboard/tasks');
    return () => clearInterval(timerRef.current);
  }, []);

  if (!sale) return null;

  const { bond, buyer, taskIndex, bondsPerDay } = sale;
  const userName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Valued Customer';

  function handleSign() {
    if (!phone.trim() || signing || signed) return;
    setSigning(true);
    setSigProgress(0);

    // Animate signature drawing (0→100 over 2s)
    let progress = 0;
    timerRef.current = setInterval(() => {
      progress += 3;
      setSigProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(timerRef.current);
        setSigning(false);
        setSigned(true);
        // Mark the task as complete in sale data
        localStorage.setItem('bondify_sale_data', JSON.stringify({ ...sale, phone, signed: true }));
      }
    }, 60);
  }

  function proceed() {
    navigate('/dashboard/tasks/claim');
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-32 lg:pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Task {taskIndex} of {bondsPerDay}</span>
          <span>·</span>
          <span className="text-emerald-500 font-medium">Sales Contract</span>
        </div>
        <h1 className="text-2xl font-bold">Sign Your Contract</h1>
        <p className="text-sm text-muted-foreground mt-1">Review the sales agreement and sign to confirm.</p>
      </div>

      {/* Contract document */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border overflow-hidden"
      >
        {/* Contract header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white text-center">
          <FileText size={28} className="mx-auto mb-2 opacity-90" />
          <h2 className="font-bold text-lg">Bond Sales Agreement</h2>
          <p className="text-sm opacity-80 mt-0.5">Bondify Financial Platform · {CONTRACT_DATE}</p>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <User size={12} /> Seller
              </div>
              <p className="font-semibold">{userName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email ?? 'Bondify User'}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <Building2 size={12} /> Buyer
              </div>
              <p className="font-semibold">{buyer.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{buyer.company}</p>
            </div>
          </div>

          {/* Bond details */}
          <div className="space-y-2.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Bond Details</p>
            <div className="space-y-1.5">
              {[
                { label: 'Bond Name', value: bond.name },
                { label: 'Bond Type', value: bond.type },
                { label: 'Buyer Pays', value: formatUGX(buyer.buyer_price) },
                { label: 'Face Value (to Bondify)', value: `- ${formatUGX(bond.face_value)}` },
                { label: 'Trust Fee (returned to you)', value: `+ ${formatUGX(bond.trust_fee)}` },
                { label: 'Your Net Profit', value: formatUGX(buyer.net_profit), highlight: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-semibold ${row.highlight ? 'text-emerald-400' : ''}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Terms */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            By signing this agreement, the seller confirms the sale of the above bond to the buyer at the agreed price. Funds will be credited to the seller's Bondify wallet within the processing window.
          </p>

          {/* Phone number */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Phone size={12} /> Your Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 0756 123456"
              disabled={signed}
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
            />
          </div>

          {/* Signature area */}
          <div className="border border-dashed border-border rounded-xl p-4 min-h-[80px] relative overflow-hidden">
            <p className="text-xs text-muted-foreground mb-3">Signature</p>
            <div className="relative h-10">
              {!signed && !signing && (
                <p className="text-muted-foreground text-sm italic">Click "Sign Contract" below</p>
              )}
              {(signing || signed) && (
                <svg viewBox="0 0 300 40" className="w-full h-full">
                  <motion.path
                    d="M 10 30 C 40 5, 60 35, 90 20 C 120 5, 140 35, 170 20 C 195 8, 215 32, 240 18 C 260 8, 275 28, 290 22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="text-emerald-500"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: sigProgress / 100 }}
                    transition={{ duration: 0.06, ease: 'linear' }}
                  />
                </svg>
              )}
              {signed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-0 right-0 flex items-center gap-1 text-xs text-emerald-500 font-medium"
                >
                  <Check size={12} /> Signed
                </motion.div>
              )}
            </div>
          </div>

          {/* Sign button */}
          {!signed ? (
            <button
              onClick={handleSign}
              disabled={!phone.trim() || signing}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                !phone.trim() || signing
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
              }`}
            >
              <PenLine size={16} />
              {signing ? 'Signing…' : 'Sign Contract'}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <Check size={16} className="text-emerald-500" />
                <span className="text-sm text-emerald-400 font-medium">Contract signed and sealed!</span>
              </div>
              <button
                onClick={proceed}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Claim Your Profits →
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
