import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Trophy, Users, CheckCircle2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { formatUGX } from '@/lib/vipData';
import { getMyReferrals, getReferralLink, getL1Earnings, COMMISSION_RATES } from '@/lib/referralStore';
import { useAuth } from '@/lib/AuthContext';
import { playSound } from '@/lib/sound';

const LEVELS = [
  { level: 1, rate: COMMISSION_RATES[1] * 100, color: 'from-emerald-500 to-teal-600', label: 'Direct referrals' },
  { level: 2, rate: COMMISSION_RATES[2] * 100, color: 'from-sky-400 to-blue-500', label: "Referral's referrals" },
  { level: 3, rate: COMMISSION_RATES[3] * 100, color: 'from-violet-400 to-purple-500', label: '3rd level network' },
];

export default function Referrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [copied, setCopied] = useState(false);

  const referralLink = getReferralLink(user?.id);

  useEffect(() => {
    if (!user?.id) return;
    setReferrals(getMyReferrals(user.id));
    setEarnings(getL1Earnings(user.id));
  }, [user?.id]);

  const copyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    playSound('click');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOn = (platform) => {
    const msg = `Join Bondify and earn by distributing Australian government bonds! Use my link: ${referralLink}`;
    const urls = {
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(msg)}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      Telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(msg)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-muted-foreground text-sm">Earn from 3 levels of referrals.</p>
      </div>

      {/* Referral link */}
      <GlassCard glow glowColor="emerald">
        <p className="text-sm text-muted-foreground mb-3">Your unique referral link</p>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 mb-3">
          <code className="text-sm flex-1 truncate text-emerald-400">{referralLink || 'Loading…'}</code>
          <button
            onClick={copyLink}
            className="p-2 rounded-lg glass hover:scale-105 transition-transform flex items-center gap-1.5 text-xs font-medium"
          >
            {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['WhatsApp', 'Facebook', 'Telegram'].map((s) => (
            <MagneticButton key={s} onClick={() => shareOn(s)} strength={0.15} className="px-3 py-1.5 rounded-lg glass text-xs font-medium flex items-center gap-1.5">
              <Share2 size={12} /> {s}
            </MagneticButton>
          ))}
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard hover className="text-center">
          <div className="text-3xl font-bold text-emerald-500">{referrals.length}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Users size={11} /> Direct referrals</p>
        </GlassCard>
        <GlassCard hover className="text-center">
          <div className="text-3xl font-bold text-sky-400">{formatUGX(Math.round(earnings))}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Trophy size={11} /> L1 commissions</p>
        </GlassCard>
      </div>

      {/* Commission levels */}
      <div className="grid sm:grid-cols-3 gap-4">
        {LEVELS.map((l, i) => (
          <motion.div key={l.level} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard glow hover className="text-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${l.color} flex items-center justify-center mx-auto mb-3 font-bold text-white text-lg shadow-lg`}>
                L{l.level}
              </div>
              <p className="text-3xl font-bold text-gradient-emerald">{l.rate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Commission rate</p>
              <p className="text-xs text-muted-foreground mt-0.5">{l.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* My referrals list */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-emerald-500" size={20} />
          <h3 className="font-semibold">Your Referrals</h3>
        </div>
        {referrals.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <Users size={32} className="mx-auto opacity-20 mb-2" />
            <p>No referrals yet.</p>
            <p className="text-xs mt-1">Share your link to start earning commissions.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                    {r.referredEmail?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.referredEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(r.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-500 font-semibold">L1</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
