import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Bell, Lock, Smartphone, Eye, EyeOff,
  Fingerprint, KeyRound, ChevronRight, Check,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { playSound } from '@/lib/sound';

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Profile() {
  const [tab, setTab] = useState('personal');
  const [saved, setSaved] = useState(false);

  // Personal info state
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+256 772 123 456');

  // Security state
  const [twoFA, setTwoFA] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Notification preferences
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [notifTransactions, setNotifTransactions] = useState(true);

  const handleSave = (e) => {
    e?.preventDefault();
    playSound('success');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80" alt="" className="w-full h-32 sm:h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex items-center gap-4 p-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{fullName}</h1>
            <p className="text-white/70 text-sm">VIP2 · Bronze · Member since Jul 2026</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); playSound('click'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {tab === 'personal' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <h2 className="font-bold text-lg mb-4">Personal Information</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <MagneticButton type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center gap-2">
                {saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
              </MagneticButton>
            </form>
          </GlassCard>
        </motion.div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Security toggles */}
          <GlassCard className="p-6">
            <h2 className="font-bold text-lg mb-4">Account Security</h2>
            <div className="space-y-1">
              <ToggleRow
                icon={KeyRound}
                title="Two-Factor Authentication"
                desc="Require OTP code at every login"
                checked={twoFA}
                onChange={(v) => { setTwoFA(v); playSound('click'); }}
              />
              <ToggleRow
                icon={Fingerprint}
                title="Biometric Login"
                desc="Use fingerprint or face ID on mobile"
                checked={biometric}
                onChange={(v) => { setBiometric(v); playSound('click'); }}
              />
              <ToggleRow
                icon={Smartphone}
                title="Login Alerts"
                desc="Get notified of new device logins"
                checked={loginAlerts}
                onChange={(v) => { setLoginAlerts(v); playSound('click'); }}
              />
            </div>
          </GlassCard>

          {/* Change password */}
          <GlassCard className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Lock size={18} /> Change Password</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <PasswordInput label="Current Password" value={currentPass} onChange={setCurrentPass} show={showPassword} setShow={setShowPassword} />
              <PasswordInput label="New Password" value={newPass} onChange={setNewPass} show={showPassword} setShow={setShowPassword} />
              <PasswordInput label="Confirm New Password" value={confirmPass} onChange={setConfirmPass} show={showPassword} setShow={setShowPassword} />
              <MagneticButton type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center gap-2">
                {saved ? <><Check size={16} /> Updated!</> : 'Update Password'}
              </MagneticButton>
            </form>
          </GlassCard>

          {/* Sessions */}
          <GlassCard className="p-6">
            <h2 className="font-bold text-lg mb-4">Active Sessions</h2>
            <div className="space-y-2">
              <SessionRow device="Chrome · Windows" location="Kampala, UG" current />
              <SessionRow device="Safari · iPhone" location="Kampala, UG" />
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <h2 className="font-bold text-lg mb-4">Notification Preferences</h2>
            <div className="space-y-1">
              <ToggleRow
                icon={Mail}
                title="Email Notifications"
                desc="Receive updates via email"
                checked={notifEmail}
                onChange={(v) => { setNotifEmail(v); playSound('click'); }}
              />
              <ToggleRow
                icon={Smartphone}
                title="SMS Notifications"
                desc="Receive updates via SMS"
                checked={notifSms}
                onChange={(v) => { setNotifSms(v); playSound('click'); }}
              />
              <ToggleRow
                icon={Bell}
                title="Push Notifications"
                desc="In-app push alerts"
                checked={notifPush}
                onChange={(v) => { setNotifPush(v); playSound('click'); }}
              />
              <ToggleRow
                icon={Shield}
                title="Transaction Alerts"
                desc="Notify on every deposit & withdrawal"
                checked={notifTransactions}
                onChange={(v) => { setNotifTransactions(v); playSound('click'); }}
              />
              <ToggleRow
                icon={ChevronRight}
                title="Marketing & Promotions"
                desc="Offers, new bonds, and VIP upgrades"
                checked={notifMarketing}
                onChange={(v) => { setNotifMarketing(v); playSound('click'); }}
              />
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

function ToggleRow({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, setShow }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function SessionRow({ device, location, current }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border">
      <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
        <Smartphone size={16} className="text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium flex items-center gap-2">
          {device}
          {current && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">Current</span>}
        </p>
        <p className="text-xs text-muted-foreground">{location}</p>
      </div>
      {!current && (
        <button className="text-xs text-danger font-medium hover:underline">Revoke</button>
      )}
    </div>
  );
}