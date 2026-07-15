import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Trophy, Users, CheckCircle2, Gift, Zap } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { formatUGX } from '@/lib/vipData';
import {
  getMyReferralCode, getReferralLink, getMyReferrals, getCommissionRates,
} from '@/lib/referralStore';
import { syncUserReferrals, syncReferralEarnings } from '@/lib/supabase_ops';
import { useAuth } from '@/lib/AuthContext';
import { playSound } from '@/lib/sound';

export default function Referrals() {
  const { user } = useAuth();
  const [lv1Count, setLv1Count] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [rates, setRates] = useState({ 1: 0.05, 2: 0.02, 3: 0.01 });
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const myCode = getMyReferralCode(user?.id);
  const referralLink = getReferralLink(user?.id);

  useEffect(() => {
    if (!user?.id) return;
    setRates(getCommissionRates());
    // Sync referrals (for count) and earnings (for amount) from Supabase
    syncUserReferrals(user.id).then(() => {
      setLv1Count(getMyReferrals(user.id).length);
    });
    syncReferralEarnings(user.id).then((earned) => {
      setTotalEarned(earned);
    });
  }, [user?.id]);

  const copyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    playSound('click');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(myCode);
    playSound('click');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareOn = (platform) => {
    const msg = `🎯 I'm earning daily from Bondify! Join me and get a UGX 5,000 welcome bonus.\n\nUse my link: ${referralLink}\n\nCode: ${myCode}`;
    const urls = {
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(msg)}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      Telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(msg)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
    playSound('click');
  };

  const LEVELS = [
    {
      level: 1, label: 'Direct Referrals', sublabel: 'People you invite',
      rate: Math.round(rates[1] * 100), color: 'from-emerald-500 to-teal-600',
      count: lv1Count, earned: totalEarned,
      desc: 'When someone joins using your link and recharges, you get this % of their deposit.',
    },
    {
      level: 2, label: 'Level 2', sublabel: "Your referrals' referrals",
      rate: Math.round(rates[2] * 100), color: 'from-sky-400 to-blue-500',
      count: 0, earned: 0,
      desc: 'When someone invited by your friends recharges, you also earn a cut.',
    },
    {
      level: 3, label: 'Level 3', sublabel: '3rd level network',
      rate: Math.round(rates[3] * 100), color: 'from-violet-400 to-purple-500',
      count: 0, earned: 0,
      desc: 'Your network grows deep — earn from 3 levels of referrals.',
    },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Invite &amp; Earn</h1>
        <p className="text-muted-foreground text-sm">Bring friends in — earn real money from 3 levels.</p>
      </div>

      {/* Summary card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users size={14} className="text-white/70" />
                <span className="text-white/70 text-xs">Total Invited</span>
              </div>
              <p className="text-3xl font-black text-white">{lv1Count}</p>
              <p className="text-white/60 text-[11px] mt-0.5">across all levels</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Trophy size={14} className="text-white/70" />
                <span className="text-white/70 text-xs">Total Rewards</span>
              </div>
              <p className="text-3xl font-black text-white">{formatUGX(totalEarned)}</p>
              <p className="text-white/60 text-[11px] mt-0.5">withdrawable now</p>
            </div>
          </div>

          {totalEarned > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20 text-center">
              <p className="text-white/80 text-xs">
                <Zap size={11} className="inline mr-1 text-yellow-300" />
                Your rewards are already in your wallet — withdraw anytime!
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Referral link */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="glass rounded-2xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Your Referral Link</p>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
            >
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest">{myCode}</span>
              {copiedCode ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} className="text-emerald-400" />}
            </button>
          </div>

          {/* Attractive earn teaser */}
          <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-xs text-amber-400 font-semibold">📣 Share this and earn on every deposit they make</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Up to {Math.round(rates[1] * 100)}% commission — paid instantly to your wallet</p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 mb-3">
            <code className="text-sm flex-1 truncate text-emerald-400 font-mono">{referralLink || 'Loading…'}</code>
            <button
              onClick={copyLink}
              className="px-3 py-1.5 rounded-lg glass hover:scale-105 transition-transform flex items-center gap-1.5 text-xs font-medium shrink-0"
            >
              {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="flex gap-2">
            {['WhatsApp', 'Telegram', 'Facebook'].map((s) => (
              <button
                key={s}
                onClick={() => shareOn(s)}
                className="flex-1 py-2 rounded-xl glass text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-muted/60 transition-colors"
              >
                <Share2 size={11} /> {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 3 Level cards */}
      <div className="space-y-3">
        {LEVELS.map((l, i) => (
          <motion.div
            key={l.level}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="glass rounded-2xl border border-border overflow-hidden">
              <div className={`bg-gradient-to-r ${l.color} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                    <span className="font-black text-white text-sm">L{l.level}</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{l.label}</p>
                    <p className="text-white/70 text-[10px]">{l.sublabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">{l.rate}%</p>
                  <p className="text-white/70 text-[9px]">commission</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="flex-1 text-center border-r border-border pr-4">
                  <p className="text-2xl font-black">{l.count}</p>
                  <p className="text-[10px] text-muted-foreground">people</p>
                </div>
                <div className="flex-1 text-center pl-4">
                  <p className={`text-xl font-black ${l.earned > 0 ? 'text-emerald-400' : 'text-foreground'}`}>{formatUGX(l.earned)}</p>
                  <p className="text-[10px] text-muted-foreground">earned</p>
                </div>
              </div>
              <div className="px-4 pb-3">
                <p className="text-[11px] text-muted-foreground">{l.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Gift size={16} className="text-amber-400" />
          <h3 className="font-semibold text-sm">How Referrals Work</h3>
        </div>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Share your link', desc: 'Copy your unique referral link and send it to friends and family on WhatsApp, Telegram, or anywhere.' },
            { step: '2', title: 'They join and recharge', desc: `When your friend creates an account and makes their first recharge, you automatically earn ${Math.round(rates[1] * 100)}% of their deposit amount directly in your wallet.` },
            { step: '3', title: 'Earn from their network too', desc: `When someone your friend invited also recharges, you earn ${Math.round(rates[2] * 100)}% of that too — all the way to Level 3 (${Math.round(rates[3] * 100)}%).` },
            { step: '4', title: 'Withdraw instantly', desc: 'Your referral rewards are added to your wallet immediately and can be withdrawn at any time — no waiting period.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-xs">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
