import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, BarChart2, Sparkles, ArrowUpRight, Users,
  ChevronRight, Gift,
} from 'lucide-react';

const STEPS = [
  {
    icon: RefreshCw,
    color: 'from-emerald-500 to-teal-600',
    title: 'Step 1 — Recharge Your Wallet',
    body: [
      'Before anything else, you need money in your wallet.',
      'The minimum to start is UGX 20,000.',
      'Go to the Recharge page, enter the amount, then follow the payment instructions shown to you.',
      'As soon as the admin approves it (usually within a few minutes), your wallet gets credited plus your UGX 5,000 welcome bonus is unlocked immediately.',
    ],
  },
  {
    icon: BarChart2,
    color: 'from-sky-400 to-blue-500',
    title: 'Step 2 — Buy a Bond Package',
    body: [
      'Tap "Invest" at the bottom of the screen.',
      'You will see bond packages for different budgets.',
      'Each package shows you exactly how much you will earn every single day.',
      'Tap "Buy Now" on the one you can afford. The price is taken from your wallet and your bond starts immediately.',
      'Your daily earnings add up Everyday',
    ],
  },
  {
    icon: Sparkles,
    color: 'from-amber-400 to-yellow-500',
    title: 'Step 3 — Earn Every Morning',
    body: [
      'Every morning when you open the Bondify app, your daily income is automatically added to your wallet.',
      'You don\'t need to do anything, the bond works for you.',
      'Your bond runs for a set number of days (30 to 360 depending on the package).',
      'The longer you hold without withdrawing, the more you earn total.',
    ],
  },
  {
    icon: ArrowUpRight,
    color: 'from-rose-400 to-pink-500',
    title: 'Step 4 — Withdraw When You\'re Ready',
    body: [
      'You can withdraw your balance at any time after 24 hours.',
      'Go to the Withdrawals page, enter your phone number, and request a payout.',
      'Withdrawals are processed by the admin usually within a few hours.',
      'But here\'s a tip: the longer you let your earnings grow, the more money you make. Think of it like a savings account that pays you daily.',
    ],
  },
  {
    icon: Users,
    color: 'from-violet-400 to-purple-500',
    title: 'Step 5 — Invite Friends and Earn More',
    body: [
      'For every friend who joins using your referral link and recharges, you earn a percentage of their deposit straight to your wallet.',
      'These rewards hit your wallet automatically. No waiting, no manual claims.',
    ],
  },
];

export default function LearnDaily() {
  return (
    <div className="max-w-lg mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-xl glass hover:bg-muted/50 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">How Daily Earning Works</h1>
          <p className="text-xs text-muted-foreground">Simple guide — 5 minutes to understand everything</p>
        </div>
      </div>

      {/* Intro banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 mb-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={18} className="text-yellow-300" />
          <p className="font-bold text-sm">Bondify Daily Earning</p>
        </div>
        <p className="text-white/90 text-sm leading-relaxed">
          You put money in → You buy a bond → Your bond earns money for you every day → You withdraw when you want.
          That simple. No selling. No complicated tasks. Just daily passive income.
        </p>
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

      {/* FAQ quick answers */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="mt-6 glass rounded-2xl p-4 space-y-4">
        <p className="font-semibold text-sm">Quick Answers</p>
        {[
          { q: 'What if I lose my money?', a: 'Your bond investment is locked in for the duration. Daily earnings are credited every morning to your wallet balance.' },
          { q: 'Can I buy more than one bond?', a: 'Yes for Sales Tasks! You can buy as many bonds as your balance allows. Each bond earns independently.' },
          { q: 'Is my money safe?', a: 'Your funds are tied to government treasury bonds. The platform processes payouts every day directly to your phone.' },
          { q: 'How fast do withdrawals happen?', a: 'Admin reviews and processes withdrawals. Most are done within the same day.' },
        ].map((faq, i) => (
          <div key={i} className="space-y-1">
            <p className="text-sm font-semibold text-emerald-400">{faq.q}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/dashboard/deposit">
          <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2">
            Recharge Now <ChevronRight size={14} />
          </button>
        </Link>
        <Link to="/dashboard/invest">
          <button className="w-full py-3.5 rounded-2xl glass border border-border font-bold text-sm flex items-center justify-center gap-2">
            View Bonds <ChevronRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}
