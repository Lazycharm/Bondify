import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Bell, Lock, Eye, EyeOff,
  Check, LogOut, KeyRound, AlertTriangle, Crown, TrendingUp,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { playSound } from '@/lib/sound';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { uploadUserProfile } from '@/lib/supabase_ops';
import { getWalletBalance } from '@/lib/depositStore';
import { VIP_LEVELS, formatUGX } from '@/lib/vipData';

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Alerts', icon: Bell },
];

const PROFILE_KEY = 'bondify_profile';

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); }
  catch { return {}; }
}

function saveProfile(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...loadProfile(), ...data }));
}

function getCurrentVip(balance) {
  const sorted = [...VIP_LEVELS].sort((a, b) => b.min_investment - a.min_investment);
  return sorted.find((v) => balance >= v.min_investment) ?? VIP_LEVELS[0];
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('personal');
  const [saved, setSaved] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const stored = loadProfile();
  const authName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '';
  const authEmail = user?.email ?? '';

  const [fullName, setFullName] = useState(stored.fullName || authName);
  const [phone, setPhone] = useState(stored.phone || '');
  const [showPass, setShowPass] = useState(false);
  const [_currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Notification prefs
  const [notifEmail, setNotifEmail] = useState(stored.notifEmail !== false);
  const [notifSms, setNotifSms] = useState(stored.notifSms !== false);
  const [notifPush, setNotifPush] = useState(stored.notifPush === true);
  const [notifTransactions, setNotifTransactions] = useState(stored.notifTransactions !== false);
  const [notifMarketing, setNotifMarketing] = useState(stored.notifMarketing === true);

  const balance = getWalletBalance();
  const vip = getCurrentVip(balance);
  const initial = (fullName?.[0] ?? authEmail?.[0] ?? 'U').toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : 'Recent';

  function handleSavePersonal(e) {
    e?.preventDefault();
    saveProfile({ fullName, phone });
    if (user?.id) uploadUserProfile(user.id, { fullName, phone }).catch(() => {});
    playSound('success');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSaveNotifs() {
    saveProfile({ notifEmail, notifSms, notifPush, notifTransactions, notifMarketing });
    playSound('success');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleChangePassword(e) {
    e?.preventDefault();
    setPassMsg('');
    setPassErr('');
    if (!newPass || newPass.length < 6) { setPassErr('Password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setPassErr('Passwords do not match.'); return; }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setPassMsg('Password updated successfully!');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      playSound('success');
    } catch (err) {
      setPassErr(err.message || 'Failed to update password. Please try again.');
    }
  }

  return (
    <div className="space-y-5 max-w-xl mx-auto pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden glass border border-border">
        <div className="h-20 bg-gradient-to-r from-emerald-600 to-teal-700" />
        <div className="px-5 pb-5 -mt-8 flex items-end gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-black border-4 border-card shadow-xl shrink-0">
            {initial}
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate">{fullName || authEmail}</h1>
            <p className="text-xs text-muted-foreground truncate">{authEmail}</p>
          </div>
          <div className="pb-1 text-right shrink-0">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${vip.color} bg-opacity-10 border border-white/10`}>
              <Crown size={11} className="text-white" />
              <span className="text-[11px] font-bold text-white">{vip.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Member since {memberSince}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
          <div className="py-3 text-center">
            <p className="text-lg font-black">{formatUGX(balance)}</p>
            <p className="text-[10px] text-muted-foreground">Wallet Balance</p>
          </div>
          <div className="py-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-lg font-black">{vip.level}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">VIP Level</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); playSound('click'); setSaved(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              tab === t.id ? 'bg-primary text-primary-foreground shadow-lg' : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Personal Info Tab */}
        {tab === 'personal' && (
          <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <GlassCard hover={false}>
              <h2 className="font-bold text-base mb-4">Personal Information</h2>
              <form onSubmit={handleSavePersonal} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={authEmail}
                      disabled
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Email is managed by your account provider.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 7XX XXX XXX"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <MagneticButton
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center gap-2"
                >
                  {saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
                </MagneticButton>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <GlassCard hover={false}>
              <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                <Lock size={17} className="text-emerald-400" /> Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <PasswordInput
                  label="New Password"
                  value={newPass}
                  onChange={setNewPass}
                  show={showPass}
                  setShow={setShowPass}
                  placeholder="At least 6 characters"
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={confirmPass}
                  onChange={setConfirmPass}
                  show={showPass}
                  setShow={setShowPass}
                  placeholder="Repeat new password"
                />
                {passErr && (
                  <div className="flex items-start gap-2 text-rose-400 text-xs">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {passErr}
                  </div>
                )}
                {passMsg && (
                  <div className="flex items-start gap-2 text-emerald-400 text-xs">
                    <Check size={13} className="shrink-0 mt-0.5" /> {passMsg}
                  </div>
                )}
                <MagneticButton
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center gap-2"
                >
                  <KeyRound size={15} /> Update Password
                </MagneticButton>
              </form>
            </GlassCard>

            <GlassCard hover={false}>
              <h2 className="font-bold text-base mb-1">Account Info</h2>
              <p className="text-xs text-muted-foreground mb-4">Your account details at a glance.</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium truncate max-w-[60%] text-right">{authEmail}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{memberSince}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">VIP Level</span>
                  <span className="font-medium text-amber-400">VIP {vip.level} · {vip.name}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <GlassCard hover={false}>
              <h2 className="font-bold text-base mb-4">Notification Preferences</h2>
              <div className="space-y-0">
                <ToggleRow
                  icon={Mail}
                  title="Email Notifications"
                  desc="Receive updates via email"
                  checked={notifEmail}
                  onChange={(v) => { setNotifEmail(v); playSound('click'); }}
                />
                <ToggleRow
                  icon={Phone}
                  title="SMS Notifications"
                  desc="Receive alerts via SMS"
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
                  desc="On every deposit and withdrawal"
                  checked={notifTransactions}
                  onChange={(v) => { setNotifTransactions(v); playSound('click'); }}
                />
                <ToggleRow
                  icon={TrendingUp}
                  title="Promotions & Offers"
                  desc="New bonds, VIP upgrades, and deals"
                  checked={notifMarketing}
                  onChange={(v) => { setNotifMarketing(v); playSound('click'); }}
                  last
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveNotifs}
                className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center gap-2"
              >
                {saved ? <><Check size={16} /> Saved!</> : 'Save Preferences'}
              </motion.button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <button
          onClick={() => { playSound('click'); logout(); }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl glass border border-rose-500/20 text-rose-400 font-semibold text-sm hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </motion.div>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, desc, checked, onChange, last }) {
  return (
    <div className={`flex items-center gap-3 py-3 ${!last ? 'border-b border-border/50' : ''}`}>
      <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
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

function PasswordInput({ label, value, onChange, show, setShow, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}
