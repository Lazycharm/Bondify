import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import {
  TrendingUp, Shield, Zap, Gift, Crown, ArrowRight, Play,
  CheckCircle2, Users, Wallet, BarChart3, HandCoins,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import CountUp from '@/components/ui/count-up';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { VIP_LEVELS, formatUGXShort } from '@/lib/vipData';

const STATS = [
  { label: 'Active Traders', value: 48250, suffix: '+', icon: Users },
  { label: 'Bonds Sold', value: 127800, suffix: '+', icon: TrendingUp },
  { label: "Today's Profits Paid", value: 18500000, format: 'short', icon: Wallet },
  { label: "Today's Withdrawals", value: 9400000, format: 'short', icon: BarChart3 },
];

const FEATURES = [
  { icon: Shield, title: 'Bank-Grade Security', desc: 'End-to-end encryption and audit trails protect every transaction.', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80' },
  { icon: HandCoins, title: 'Sell to Highest Buyer', desc: '3 buyers compete for each bond — pick the highest price and earn instant profit.', image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600&q=80' },
  { icon: Crown, title: '10 VIP Levels', desc: 'Progress from Starter to Crown with bigger bonds and higher profits.', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80' },
  { icon: Gift, title: 'Daily Rewards', desc: 'Treasure chests, check-in streaks, and gift codes every day.', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Get a Bond', desc: 'Pay a small trust fee to receive a bond assigned to your account.' },
  { step: '02', title: 'Choose Your Buyer', desc: '3 buyers make offers. Pick the highest bid to maximize your profit.' },
  { step: '03', title: 'Sign the Contract', desc: 'Sign the digital sales contract to confirm the deal.' },
  { step: '04', title: 'Claim Your Profit', desc: 'Profits are credited to your wallet instantly after each completed task.' },
];

export default function Landing() {
  const { user } = useAuth();
  const statsRef = useRef(null);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <LiveActivityFeed demo />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* YouTube background video — muted, looped, no controls */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <iframe
            src="https://www.youtube.com/embed/vAdn7aLHpO0?autoplay=1&mute=1&loop=1&playlist=vAdn7aLHpO0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Hero background"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max(100vw, 177.78vh)',
              height: 'max(100vh, 56.25vw)',
              border: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-emerald-950/85 to-navy/90 animate-gradient" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <ParticleBackground density={50} color="52, 211, 153" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300">Authorised Australian Bond Reseller Network</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-white"
          >
            Earn by Selling{' '}
            <span className="text-gradient-emerald">Australian Bonds</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto"
          >
            We sub-contract the distribution of Australian government bonds to our global network.
            You sell them to the highest buyer — we handle compliance, you keep the profit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <MagneticButton
                onClick={() => {}}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg shadow-2xl shadow-emerald-500/40 flex items-center gap-2"
              >
                <Link to="/dashboard" className="flex items-center gap-2 text-white">
                  Go to Dashboard <ArrowRight size={20} />
                </Link>
              </MagneticButton>
            ) : (
              <>
                <MagneticButton
                  onClick={() => {}}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg shadow-2xl shadow-emerald-500/40 flex items-center gap-2"
                >
                  <Link to="/register" className="flex items-center gap-2 text-white">
                    Earn with Bonds <ArrowRight size={20} />
                  </Link>
                </MagneticButton>
                <MagneticButton
                  onClick={() => {}}
                  className="px-8 py-4 rounded-2xl glass-strong text-white font-semibold text-lg flex items-center gap-2"
                >
                  <Link to="/login" className="flex items-center gap-2 text-white">
                    <Play size={18} /> Sign In
                  </Link>
                </MagneticButton>
              </>
            )}
          </motion.div>

          {/* Floating bond chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-3"
          >
            {['91-Day T-Bill', '2-Year Bond', '5-Year Bond', 'Infra Bond', 'Savings Bond'].map((b, i) => (
              <motion.div
                key={b}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                className="glass-strong rounded-full px-4 py-2 text-sm text-white/80"
              >
                {b}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section id="stats" ref={statsRef} className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard glow className="text-center">
                  <stat.icon className="mx-auto mb-3 text-emerald-500" size={24} />
                  <div className="text-2xl sm:text-3xl font-bold text-gradient-emerald">
                    {stat.format === 'short' ? (
                      <CountUp value={stat.value} prefix="" suffix="" />
                    ) : (
                      <CountUp value={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Four simple steps to turn bond sales into daily profit.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard hover className="h-full">
                  <p className="text-4xl font-bold text-emerald-500/30 mb-3">{step.step}</p>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Built for serious traders
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Everything you need to profit from bond sales — beautifully designed.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard hover className="h-full overflow-hidden p-0">
                  <div className="relative h-32 overflow-hidden">
                    <img src={f.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-emerald-500/90 flex items-center justify-center backdrop-blur-sm">
                      <f.icon className="text-white" size={20} />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP PREVIEW */}
      <section id="vip" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Climb the <span className="text-gradient-gold">VIP ladder</span>
            </h2>
            <p className="mt-3 text-muted-foreground">10 levels. Bigger bonds and higher profits at every step.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {VIP_LEVELS.map((vip, i) => (
              <motion.div
                key={vip.level}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard hover className="text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${vip.color} flex items-center justify-center mx-auto mb-3 font-bold text-white shadow-lg`}>
                    {vip.level}
                  </div>
                  <p className="font-semibold text-sm">{vip.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    from {formatUGXShort(vip.min_investment)}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BONUS BANNER */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10"
          >
            <div className="text-5xl sm:text-6xl shrink-0">🎁</div>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Get UGX 10,000 free when you join</h3>
              <p className="text-white/80 mt-2 text-sm sm:text-base max-w-md">
                Every new member gets a UGX 10,000 welcome bonus on their first deposit.
                Complete your first day of bond tasks and it's yours — fully withdrawable, no catch.
              </p>
            </div>
            <Link
              to="/register"
              className="shrink-0 px-7 py-3.5 rounded-2xl bg-white text-amber-600 font-bold text-sm hover:bg-amber-50 transition-colors shadow-xl whitespace-nowrap"
            >
              Claim Your Bonus →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center"
          >
            <img
              src="https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-teal-800/90 animate-gradient" />
            <ParticleBackground density={30} color="255, 255, 255" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Join our global bond network today
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Get a UGX 10,000 welcome bonus. Start reselling Australian government bonds within minutes.
              </p>
              <MagneticButton
                onClick={() => {}}
                className="px-8 py-4 rounded-2xl bg-white text-emerald-700 font-bold text-lg shadow-2xl"
              >
                <Link to="/register" className="flex items-center gap-2 text-emerald-700">
                  Create Free Account <ArrowRight size={20} />
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-sm">
              B
            </div>
            <span className="font-bold">Bondify</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Bondify. Bond Sales & Optimization Platform.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
