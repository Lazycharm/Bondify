import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, CheckSquare, Users2, FileText, ArrowUpRight,
  ChevronRight, Zap, Crown,
} from 'lucide-react';

const STEPS = [
  {
    icon: RefreshCw,
    color: 'from-violet-500 to-purple-600',
    title: 'Step 1 — Unlock Sales Trader Mode',
    body: [
      'To become a Sales Trader, you make a special first deposit of exactly UGX 250,000.',
      'This is your trading capital — it activates your Sales Trader account.',
      'Once approved, your account switches to Sales Trader mode automatically.',
      'You unlock the full sales dashboard, access to bond tasks, and much bigger earning potential.',
    ],
  },
  {
    icon: CheckSquare,
    color: 'from-indigo-500 to-violet-600',
    title: 'Step 2 — Complete Your Daily Bond Tasks',
    body: [
      'Every day you get a set number of bond tasks based on your VIP level.',
      'Higher VIP = more tasks = more money per day.',
      'Go to Tasks, tap "Start", and follow the steps for each bond sale.',
      'Tasks reset every 24 hours. Complete all of them to maximize your daily earnings.',
    ],
  },
  {
    icon: Users2,
    color: 'from-sky-500 to-blue-600',
    title: 'Step 3 — Sell to Buyers',
    body: [
      'When you start a task, you are shown 3 buyers who want to buy your bond.',
      'Each buyer offers a different price. Pick the highest one — that\'s your profit.',
      'The difference between what you paid and what the buyer pays is your commission.',
      'You can earn UGX 150 to UGX 33,000+ per bond depending on your VIP level.',
    ],
  },
  {
    icon: FileText,
    color: 'from-teal-500 to-emerald-600',
    title: 'Step 4 — Sign the Contract',
    body: [
      'After choosing a buyer, a digital sales contract is generated.',
      'Review the terms and sign it. This locks in the sale.',
      'The whole process takes under 2 minutes per bond.',
      'Multiple bonds per day means multiple contract profits stacking up.',
    ],
  },
  {
    icon: ArrowUpRight,
    color: 'from-amber-500 to-orange-500',
    title: 'Step 5 — Claim Profits and Withdraw',
    body: [
      'After signing the contract, your profit is credited to your wallet.',
      'Sales Trader earnings follow a 30-day contract period.',
      'You can withdraw after the contract cycle completes.',
      'The more bonds you sell, the higher VIP level you reach, and the more you earn.',
    ],
  },
];

export default function LearnSales() {
  return (
    <div className="max-w-lg mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-xl glass hover:bg-muted/50 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">How Sales Trading Works</h1>
          <p className="text-xs text-muted-foreground">Advanced earning — bigger daily rewards</p>
        </div>
      </div>

      {/* Intro banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 p-5 mb-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="text-yellow-300" />
          <p className="font-bold text-sm">Bondify Sales Trading</p>
        </div>
        <p className="text-white/90 text-sm leading-relaxed">
          You fund your trading account → Complete daily bond sale tasks → Earn commission per bond sold →
          Withdraw your profits. Bigger investment = higher VIP = more tasks = more money every single day.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20">
          <Crown size={12} className="text-yellow-300" />
          <span className="text-xs font-semibold text-white">Requires UGX 250,000 activation deposit</span>
        </div>
      </motion.div>

      {/* Steps */}
      <div className="space-y-5">
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="glass rounded-2xl border border-border overflow-hidden">
              <div className={`bg-gradient-to-r ${step.color} px-4 py-4 flex items-center gap-3`}>
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <step.icon size={18} className="text-white" />
                </div>
                <p className="font-bold text-white text-sm">{step.title}</p>
              </div>
              <div className="p-4 space-y-2">
                {step.body.map((line, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0 mt-2" />
                    <p className="text-sm text-foreground/80 leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* VIP table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="mt-6 glass rounded-2xl p-4">
        <p className="font-semibold text-sm mb-3">Earnings Per VIP Level</p>
        {[
          { level: 'Starter (VIP 1)', tasks: '2 tasks/day', earn: 'UGX 300–600/day' },
          { level: 'Bronze (VIP 2)', tasks: '3 tasks/day', earn: 'UGX 1,500–3,000/day' },
          { level: 'Silver (VIP 3)', tasks: '4 tasks/day', earn: 'UGX 4,000–8,000/day' },
          { level: 'Gold (VIP 4)', tasks: '5 tasks/day', earn: 'UGX 10,000–20,000/day' },
          { level: 'Diamond+ (VIP 5+)', tasks: '6+ tasks/day', earn: 'UGX 25,000+/day' },
        ].map((row) => (
          <div key={row.level} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <p className="text-xs font-semibold">{row.level}</p>
              <p className="text-[10px] text-muted-foreground">{row.tasks}</p>
            </div>
            <p className="text-xs font-bold text-violet-400">{row.earn}</p>
          </div>
        ))}
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/dashboard/deposit">
          <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2">
            Activate Now <ChevronRight size={14} />
          </button>
        </Link>
        <Link to="/dashboard/tasks">
          <button className="w-full py-3.5 rounded-2xl glass border border-border font-bold text-sm flex items-center justify-center gap-2">
            My Tasks <ChevronRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}
