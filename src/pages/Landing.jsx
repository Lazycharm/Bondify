import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import {
  ArrowRight, Users, Wallet, Gift, TrendingUp, CheckCircle2,
  Star, Shield, Smartphone,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import GlassCard from '@/components/ui/GlassCard';
import { INVEST_PRODUCTS } from '@/lib/investData';

const STEPS = [
  { step: '1', icon: Wallet, color: 'bg-emerald-500', title: 'Recharge Your Wallet', desc: 'Add funds to your Bondify wallet through our secure payment gateway. Low minimum, takes just 2 minutes.' },
  { step: '2', icon: TrendingUp, color: 'bg-sky-500', title: 'Buy a Bond', desc: 'Choose a bond package that fits your budget. Your bond starts earning money for you every single day, automatically.' },
  { step: '3', icon: Gift, color: 'bg-amber-500', title: 'Collect Your Money', desc: 'Every morning, your daily earnings are added to your wallet. Withdraw whenever you want — straight to your phone.' },
];

const TRUST = [
  { icon: Shield, label: 'Safe & Secure', desc: 'Your money is protected and tracked in real-time' },
  { icon: Smartphone, label: 'Works on Any Phone', desc: 'No laptop needed — runs perfectly on mobile' },
  { icon: Users, label: 'Global Community', desc: 'Members worldwide already earning daily' },
  { icon: Star, label: 'Welcome Bonus', desc: 'Get a free bonus just for joining today' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Video background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <iframe
            src="https://www.youtube.com/embed/vAdn7aLHpO0?autoplay=1&mute=1&loop=1&playlist=vAdn7aLHpO0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Hero background"
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max(100vw, 177.78vh)', height: 'max(100vh, 56.25vw)',
              border: 'none', pointerEvents: 'none',
            }}
          />
        </div>
        {/* Strong flat overlay so text is always readable over any video frame */}
        <div className="absolute inset-0 bg-[#0a1628]/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background/95" />
        <ParticleBackground density={40} color="52, 211, 153" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
            <img src="/logo.png" alt="Bondify" className="h-24 w-auto object-contain" />
          </motion.div>

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong text-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-medium">Live — People earning right now</span>
          </motion.div>

          {/* Big heading — simple words */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight"
          >
            Put Money In.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Earn Every Day.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-lg sm:text-xl text-white/75 max-w-xl mx-auto leading-relaxed"
          >
            Bondify lets you earn daily income from government bonds.
            Start with a small amount and watch your money grow — no experience needed.
          </motion.p>

          {/* Bonus highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/20 border border-amber-400/30"
          >
            <Gift size={18} className="text-amber-400" />
            <span className="text-amber-300 font-semibold text-sm">Join today — get a free welcome bonus</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {user ? (
              <Link to="/dashboard">
                <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-2xl shadow-emerald-500/40 flex items-center gap-2">
                  Go to Dashboard <ArrowRight size={18} />
                </button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-2xl shadow-emerald-500/40 flex items-center gap-2">
                    Start Earning Free <ArrowRight size={18} />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="px-8 py-4 rounded-2xl glass-strong text-white font-semibold text-base">
                    I Already Have an Account
                  </button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Social proof numbers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-8 flex-wrap"
          >
            {[
              { value: '48,250+', label: 'Active Members' },
              { value: '$18.5M+', label: "Paid Out" },
              { value: 'Low Min.', label: 'To Start' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS — super simple */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black">3 Simple Steps to Earn</h2>
            <p className="text-muted-foreground mt-2">Even if this is your first time investing — you'll understand in 60 seconds.</p>
          </motion.div>

          <div className="space-y-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="glass rounded-2xl p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
                    <step.icon size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-muted-foreground">STEP {step.step}</span>
                    </div>
                    <p className="font-bold text-base mb-1">{step.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Link to="/register">
              <button className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-500/30 flex items-center gap-2 mx-auto">
                Join Now — It's Free <ArrowRight size={18} />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* BOND PACKAGES preview */}
      <section className="py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-black">Choose Your Bond Package</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">More you put in, more you earn every day. Simple.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INVEST_PRODUCTS.slice(0, 6).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="glass rounded-2xl border border-border overflow-hidden">
                  <div className={`bg-gradient-to-br ${product.color} px-3 py-3`}>
                    <p className="text-white font-bold text-xs">{product.name}</p>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">Daily return</span>
                      <span className="text-[11px] font-bold text-emerald-400">{((product.daily_income / product.price) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">Duration</span>
                      <span className="text-[11px] font-bold">{product.duration}d</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            All packages + 4 more available inside the app
          </p>
        </div>
      </section>

      {/* TRUST signals */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-black">Why People Trust Bondify</h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {TRUST.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard hover className="text-center py-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <t.icon size={20} className="text-emerald-500" />
                  </div>
                  <p className="font-bold text-sm">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-10 border border-emerald-500/20"
          >
            <div className="text-5xl mb-4">💰</div>
            <h2 className="text-2xl font-black mb-2">Ready to Start Earning?</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Sign up free. Add funds with a low minimum. Your money starts working for you tomorrow morning.
            </p>
            <div className="space-y-2">
              {['Free to join — no monthly fees', 'Free welcome bonus on signup', 'Withdraw to your phone anytime'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/register">
              <button className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2">
                Create Free Account <ArrowRight size={18} />
              </button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Takes less than 2 minutes</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 Bondify. Earn daily from government bond distribution.
        </p>
      </footer>
    </div>
  );
}
