import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Send, CheckCircle2, Smartphone, Bot, Shield, Camera, BarChart2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getPaymentSettings, savePaymentSettings } from '@/lib/paymentSettings';
import { sendTelegram } from '@/lib/telegramNotify';
import { playSound } from '@/lib/sound';
import { getBondConfig, saveBondConfig, getBondImages, saveBondImages } from '@/lib/investData';

function Field({ label, id, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium block">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminSettings() {
  const [form, setForm] = useState(() => getPaymentSettings());
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  // Bond config state
  const [bonds, setBonds] = useState(() => getBondConfig());
  const [bondImages, setBondImages] = useState(() => getBondImages());
  const [bondsSaved, setBondsSaved] = useState(false);
  const fileRefs = useRef({});

  function updateBond(id, key, value) {
    setBonds((prev) => prev.map((b) => b.id === id ? { ...b, [key]: value } : b));
  }

  function handleBondImageUpload(id, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = { ...bondImages, [id]: e.target.result };
      setBondImages(updated);
      saveBondImages(updated);
    };
    reader.readAsDataURL(file);
  }

  function saveBonds() {
    saveBondConfig(bonds);
    saveBondImages(bondImages);
    playSound('success');
    setBondsSaved(true);
    setTimeout(() => setBondsSaved(false), 2500);
  }

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  function handleSave() {
    savePaymentSettings(form);
    playSound('success');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function testTelegram() {
    setTesting(true);
    setTestResult('');
    savePaymentSettings(form);
    try {
      await sendTelegram('✅ <b>Bondify Admin</b>\n\nTelegram notifications are working correctly!');
      setTestResult('success');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure payment accounts, Telegram bot, and access control.</p>
      </div>

      {/* MTN */}
      <GlassCard hover={false} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center">
            <span className="font-black text-black text-xs">MTN</span>
          </div>
          <h2 className="font-semibold">MTN Mobile Money Account</h2>
        </div>
        <Field label="MTN Number" id="mtn_number" value={form.mtn_number} onChange={set('mtn_number')} placeholder="e.g. 0772 123 456" />
        <Field label="Account Name" id="mtn_name" value={form.mtn_name} onChange={set('mtn_name')} placeholder="e.g. JOHN DOE" />
      </GlassCard>

      {/* Airtel */}
      <GlassCard hover={false} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
            <span className="font-bold text-white text-xs italic">air</span>
          </div>
          <h2 className="font-semibold">Airtel Money Account</h2>
        </div>
        <Field label="Airtel Number" id="airtel_number" value={form.airtel_number} onChange={set('airtel_number')} placeholder="e.g. 0752 123 456" />
        <Field label="Account Name" id="airtel_name" value={form.airtel_name} onChange={set('airtel_name')} placeholder="e.g. JANE DOE" />
      </GlassCard>

      {/* Telegram */}
      <GlassCard hover={false} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Telegram Bot Notifications</h2>
            <p className="text-xs text-muted-foreground">Receive alerts for deposits, withdrawals, and new users.</p>
          </div>
        </div>
        <Field
          label="Bot Token"
          id="telegram_token"
          value={form.telegram_token}
          onChange={set('telegram_token')}
          placeholder="123456:ABC-DEF..."
          hint="Get this from @BotFather on Telegram after creating your bot."
        />
        <Field
          label="Chat ID"
          id="telegram_chat_id"
          value={form.telegram_chat_id}
          onChange={set('telegram_chat_id')}
          placeholder="e.g. -1001234567890"
          hint="Your Telegram user ID or group/channel ID. Use @userinfobot to find yours."
        />
        <button
          onClick={testTelegram}
          disabled={testing || !form.telegram_token || !form.telegram_chat_id}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-500/40 text-sky-500 text-sm font-medium hover:bg-sky-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={15} /> {testing ? 'Sending...' : 'Send Test Message'}
        </button>
        {testResult === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-500 text-sm">
            <CheckCircle2 size={15} /> Test message sent successfully!
          </motion.div>
        )}
        {testResult === 'error' && (
          <p className="text-rose-500 text-sm">Failed — check your token and chat ID.</p>
        )}
      </GlassCard>

      {/* Admin access */}
      <GlassCard hover={false} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Admin Access</h2>
            <p className="text-xs text-muted-foreground">Only these emails can access the admin panel.</p>
          </div>
        </div>
        <Field
          label="Admin Emails"
          id="admin_emails"
          value={form.admin_emails}
          onChange={set('admin_emails')}
          placeholder="admin@example.com, another@example.com"
          hint="Comma-separated list. Leave blank to allow any logged-in user (not recommended in production)."
        />
      </GlassCard>

      {/* Support Telegram Link */}
      <GlassCard hover={false} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-sky-400 flex items-center justify-center">
            <Smartphone size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Support Link</h2>
            <p className="text-xs text-muted-foreground">Where users land when they tap "Support" in the sidebar.</p>
          </div>
        </div>
        <Field
          label="Telegram Support Link"
          id="support_telegram_link"
          value={form.support_telegram_link || ''}
          onChange={set('support_telegram_link')}
          placeholder="https://t.me/yoursupportusername"
          hint="Paste your Telegram channel or DM link. Users are sent here when they need help."
        />
      </GlassCard>

      {/* Referral Rates */}
      <GlassCard hover={false} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Referral Commission Rates</h2>
            <p className="text-xs text-muted-foreground">Percentage of deposits paid to referrers at each level.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">Level 1 (%)</label>
            <input
              type="number"
              value={form.referral_lv1 || '5'}
              onChange={(e) => set('referral_lv1')(e.target.value)}
              placeholder="5"
              min="0"
              max="100"
              className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <p className="text-[10px] text-muted-foreground">Direct referrals</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">Level 2 (%)</label>
            <input
              type="number"
              value={form.referral_lv2 || '2'}
              onChange={(e) => set('referral_lv2')(e.target.value)}
              placeholder="2"
              min="0"
              max="100"
              className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <p className="text-[10px] text-muted-foreground">2nd level</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">Level 3 (%)</label>
            <input
              type="number"
              value={form.referral_lv3 || '1'}
              onChange={(e) => set('referral_lv3')(e.target.value)}
              placeholder="1"
              min="0"
              max="100"
              className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <p className="text-[10px] text-muted-foreground">3rd level</p>
          </div>
        </div>
      </GlassCard>

      {/* Save */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all"
      >
        {saved ? <><CheckCircle2 size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
      </button>

      {/* Bond Packages Config */}
      <div>
        <div className="flex items-center gap-3 mb-4 mt-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Bond Packages</h2>
            <p className="text-xs text-muted-foreground">Configure bond names, prices, returns, cycles and upload images.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bonds.map((bond) => (
            <GlassCard key={bond.id} hover={false} className="overflow-hidden !p-0">
              {/* Image area — click to upload */}
              <div
                className="relative cursor-pointer group"
                onClick={() => fileRefs.current[bond.id]?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => { fileRefs.current[bond.id] = el; }}
                  onChange={(e) => handleBondImageUpload(bond.id, e.target.files[0])}
                />
                {bondImages[bond.id] ? (
                  <img src={bondImages[bond.id]} alt={bond.name} className="w-full h-24 object-cover" />
                ) : (
                  <div className={`w-full h-24 bg-gradient-to-br ${bond.color} flex flex-col items-center justify-center gap-1`}>
                    <Camera size={18} className="text-white/60" />
                    <span className="text-white/60 text-[10px]">Click to upload image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <Camera size={13} className="text-white" />
                    <span className="text-white text-[11px] font-medium">{bondImages[bond.id] ? 'Change image' : 'Upload image'}</span>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="p-3 space-y-2">
                <input
                  value={bond.name}
                  onChange={(e) => updateBond(bond.id, 'name', e.target.value)}
                  placeholder="Bond name"
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Price (UGX)</label>
                    <input
                      type="number"
                      value={bond.price}
                      onChange={(e) => updateBond(bond.id, 'price', Number(e.target.value))}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Daily Income (UGX)</label>
                    <input
                      type="number"
                      value={bond.daily_income}
                      onChange={(e) => updateBond(bond.id, 'daily_income', Number(e.target.value))}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Cycle (days)</label>
                    <input
                      type="number"
                      value={bond.term}
                      onChange={(e) => updateBond(bond.id, 'term', Number(e.target.value))}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Total Returns (UGX)</label>
                    <input
                      type="number"
                      value={bond.total_income}
                      onChange={(e) => updateBond(bond.id, 'total_income', Number(e.target.value))}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <button
          onClick={saveBonds}
          className="mt-4 flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all"
        >
          {bondsSaved ? <><CheckCircle2 size={18} /> Bond Config Saved!</> : <><Save size={18} /> Save Bond Packages</>}
        </button>
      </div>
    </div>
  );
}
