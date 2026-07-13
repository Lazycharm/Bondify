import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, CheckCircle2, XCircle, Building2, ChevronRight } from 'lucide-react';
import { formatUGX } from '@/lib/vipData';

function getBondSession() {
  try {
    const raw = localStorage.getItem('bondify_active_bond');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

const RANK_COLORS = {
  3: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500 text-white', label: 'Highest Offer', glow: 'shadow-emerald-500/20' },
  2: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', badge: 'bg-amber-500 text-white', label: 'Mid Offer', glow: '' },
  1: { border: 'border-border', bg: '', badge: 'bg-muted text-muted-foreground', label: 'Lowest Offer', glow: '' },
};

export default function BuyerSelection() {
  const navigate = useNavigate();
  const session = getBondSession();

  const [visibleBuyers, setVisibleBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [result, setResult] = useState(null); // 'correct' | 'wrong'
  const [showProceed, setShowProceed] = useState(false);

  useEffect(() => {
    if (!session) { navigate('/dashboard/tasks'); return; }

    // Animate buyers arriving one by one
    const buyers = [...(session.buyers ?? [])].sort(() => Math.random() - 0.5); // shuffle display order
    buyers.forEach((buyer, i) => {
      setTimeout(() => {
        setVisibleBuyers(prev => [...prev, buyer]);
      }, 400 + i * 700);
    });
  }, []);

  if (!session) return null;

  const { bond, buyers, taskIndex, bondsPerDay } = session;

  // buyers already have buyer_price and net_profit from generateBuyerSession
  const displayBuyers = visibleBuyers.map(vb => (buyers ?? []).find(b => b.rank === vb.rank)).filter(Boolean);

  function selectBuyer(buyer) {
    if (selectedBuyer || result) return;
    setSelectedBuyer(buyer);

    const isCorrect = buyer.rank === 3;
    setResult(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      localStorage.setItem('bondify_sale_data', JSON.stringify({
        bond,
        buyer, // contains buyer_price and net_profit
        taskIndex,
        bondsPerDay,
      }));
      setTimeout(() => setShowProceed(true), 1200);
    }
  }

  function tryAgain() {
    setSelectedBuyer(null);
    setResult(null);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-32 lg:pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Task {taskIndex} of {bondsPerDay}</span>
          <span>·</span>
          <span className="text-emerald-500 font-medium">{bond.name}</span>
        </div>
        <h1 className="text-2xl font-bold">Select a Buyer</h1>
        <p className="text-muted-foreground text-sm mt-1">3 buyers are competing for your bond. Sell to the <span className="text-emerald-500 font-semibold">highest bidder</span> to maximize profit.</p>
      </div>

      {/* Bond summary */}
      <div className="glass rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
          <TrendingUp size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{bond.name}</p>
          <p className="text-xs text-muted-foreground">{bond.type} · Face value: {formatUGX(bond.face_value)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Trust Fee Paid</p>
          <p className="text-sm font-semibold text-orange-400">{formatUGX(bond.trust_fee)}</p>
        </div>
      </div>

      {/* Buyers arriving */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={14} />
          <span>Buyers arriving…</span>
          <span className="ml-auto text-xs">{visibleBuyers.length} / {(buyers ?? []).length}</span>
        </div>

        <AnimatePresence>
          {displayBuyers.map((buyer, i) => {
            const style = RANK_COLORS[buyer.rank];
            const isSelected = selectedBuyer?.rank === buyer.rank;
            const isWrong = result === 'wrong' && isSelected;
            const isRight = result === 'correct' && isSelected;

            return (
              <motion.div
                key={buyer.rank}
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26, delay: i * 0.05 }}
                onClick={() => selectBuyer(buyer)}
                className={`relative glass rounded-2xl p-5 border cursor-pointer transition-all select-none
                  ${style.border} ${style.bg} ${style.glow ? 'shadow-lg ' + style.glow : ''}
                  ${isSelected ? 'ring-2 ring-offset-1 ring-offset-background' : 'hover:scale-[1.01]'}
                  ${isRight ? 'ring-emerald-500' : ''}
                  ${isWrong ? 'ring-red-500' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm">{buyer.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${style.badge}`}>{style.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{buyer.company}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Offering</p>
                    <p className="font-bold text-base text-foreground">{formatUGX(buyer.buyer_price)}</p>
                    <p className="text-[10px] text-emerald-400">+{formatUGX(buyer.net_profit)} profit</p>
                  </div>
                </div>

                {/* Result indicator */}
                {isRight && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                    <CheckCircle2 size={22} className="text-emerald-500" />
                  </motion.div>
                )}
                {isWrong && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                    <XCircle size={22} className="text-red-500" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Not all buyers visible yet */}
        {visibleBuyers.length < (buyers ?? []).length && (
          <div className="flex items-center gap-2 glass rounded-2xl p-5 animate-pulse border border-border">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-2 bg-muted rounded w-1/2" />
            </div>
          </div>
        )}
      </div>

      {/* Wrong answer retry */}
      {result === 'wrong' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-3"
        >
          <p className="text-sm text-red-400 font-medium">
            That was not the highest offer. Study the prices carefully and pick the buyer with the highest amount.
          </p>
          <button
            onClick={tryAgain}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Correct — proceed */}
      <AnimatePresence>
        {showProceed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <p className="text-sm text-emerald-400 font-semibold">Excellent! You selected the highest buyer.</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/tasks/contract')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              Sign Sales Contract <ChevronRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
