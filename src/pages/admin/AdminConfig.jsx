import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Send, CheckCircle2, Smartphone, Bot, Shield,
  Camera, BarChart2, Percent, Clock, Users, CreditCard, Lock, Wallet, Gift,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getPaymentSettings, savePaymentSettings } from '@/lib/paymentSettings';
import { sendTelegram } from '@/lib/telegramNotify';
import { playSound } from '@/lib/sound';
import { getBondConfig, saveBondConfig, getBondImages, saveBondImages } from '@/lib/investData';

function Field({ label, id, value, onChange, placeholder, type = 'text', hint, suffix }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium block">{label}</label>}
      <div className="relative">
        <input
          id={id} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 pr-12"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, color, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function AdminConfig() {
  const [form, setForm] = useState(() => getPaymentSettings());
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  const [bonds, setBonds] = useState(() => getBondConfig());
  const [bondImages, setBondImages] = useState(() => getBondImages());
  const [bondsSaved, setBondsSaved] = useState(false);
  const fileRefs = useRef({});

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

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Config</h1>
        <p className="text-sm text-muted-foreground mt-1">All platform rules, fees, and settings in one place.</p>
      </div>

      {/* ─── Withdrawal Rules ─────────────────────────────────── */}
      <GlassCard hover={false} className="space-y-5">
        <SectionHeader icon={Percent} color="bg-rose-500" title="Withdrawal Rules" subtitle="Fee and lock periods for both earning modes." />

        <div className="space-y-4">
          <Field
            label="Withdrawal Fee (%)"
            id="withdrawal_fee_pct"
            type="number"
            value={form.withdrawal_fee_pct || '0'}
            onChange={set('withdrawal_fee_pct')}
            placeholder="0"
            suffix="%"
            hint="Percentage deducted from each withdrawal. 0 = no fee. Users see the fee and net amount before confirming."
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Min Withdrawal (UGX)"
              id="withdrawal_min_amount"
              type="number"
              value={form.withdrawal_min_amount || '10000'}
              onChange={set('withdrawal_min_amount')}
              placeholder="10000"
              hint="Smallest allowed withdrawal. Defaults to 10,000."
            />
            <Field
              label="Max Withdrawal (UGX)"
              id="withdrawal_max_amount"
              type="number"
              value={form.withdrawal_max_amount || '0'}
              onChange={set('withdrawal_max_amount')}
              placeholder="0"
              hint="Largest allowed per request. 0 = no limit."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={13} className="text-emerald-500" />
                <label className="text-sm font-medium">Daily Tasks Lock (hours)</label>
              </div>
              <input
                type="number"
                value={form.daily_lock_hrs || '24'}
                onChange={(e) => set('daily_lock_hrs')(e.target.value)}
                min="0"
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <p className="text-xs text-muted-foreground">Hours from first deposit before Daily members can withdraw bond earnings. Bonus & referral rewards are always exempt.</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={13} className="text-violet-400" />
                <label className="text-sm font-medium">Sales Tasks Lock (days)</label>
              </div>
              <input
                type="number"
                value={form.sales_lock_days || '30'}
                onChange={(e) => set('sales_lock_days')(e.target.value)}
                min="0"
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              <p className="text-xs text-muted-foreground">Days from sales activation before Sales members can withdraw. Part of the monthly contract commitment.</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ─── Deposit Limits ──────────────────────────────────── */}
      <GlassCard hover={false} className="space-y-5">
        <SectionHeader icon={Wallet} color="bg-emerald-500" title="Deposit Limits" subtitle="Min and max deposit per task type. 0 = no limit." />
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Tasks Members</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Deposit (UGX)" id="daily_deposit_min" type="number"
              value={form.daily_deposit_min || '20000'} onChange={set('daily_deposit_min')}
              placeholder="20000" hint="Minimum deposit for Daily task flow." />
            <Field label="Max Deposit (UGX)" id="daily_deposit_max" type="number"
              value={form.daily_deposit_max || '0'} onChange={set('daily_deposit_max')}
              placeholder="0" hint="0 = no maximum." />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2 border-t border-border">Sales Tasks Members</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Deposit (UGX)" id="sales_deposit_min" type="number"
              value={form.sales_deposit_min || '20000'} onChange={set('sales_deposit_min')}
              placeholder="20000" hint="Minimum deposit for Sales task flow." />
            <Field label="Max Deposit (UGX)" id="sales_deposit_max" type="number"
              value={form.sales_deposit_max || '0'} onChange={set('sales_deposit_max')}
              placeholder="0" hint="0 = no maximum." />
          </div>
        </div>
      </GlassCard>

      {/* ─── Referral Rates ──────────────────────────────────── */}
      <GlassCard hover={false} className="space-y-4">
        <SectionHeader icon={Users} color="bg-emerald-500" title="Referral Commission Rates" subtitle="Percentage of deposits paid to referrers at each level." />
        <div className="grid grid-cols-3 gap-3">
          {[['referral_lv1', 'Level 1 (%)', 'Direct referrals'], ['referral_lv2', 'Level 2 (%)', '2nd level'], ['referral_lv3', 'Level 3 (%)', '3rd level']].map(([key, label, hint]) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium block">{label}</label>
              <input
                type="number"
                value={form[key] || '0'}
                onChange={(e) => set(key)(e.target.value)}
                min="0" max="100"
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <p className="text-[10px] text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ─── Payment Accounts ────────────────────────────────── */}
      <GlassCard hover={false} className="space-y-5">
        <SectionHeader icon={CreditCard} color="bg-yellow-500" title="Payment Accounts" subtitle="Mobile money accounts users send deposits to." />
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center text-[10px] font-black text-black">MTN</span>
            <span className="text-sm font-medium">MTN Mobile Money</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field id="mtn_number" value={form.mtn_number} onChange={set('mtn_number')} placeholder="0772 123 456" label="Number" />
            <Field id="mtn_name" value={form.mtn_name} onChange={set('mtn_name')} placeholder="JOHN DOE" label="Account Name" />
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-[10px] font-bold italic text-white">air</span>
            <span className="text-sm font-medium">Airtel Money</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field id="airtel_number" value={form.airtel_number} onChange={set('airtel_number')} placeholder="0752 123 456" label="Number" />
            <Field id="airtel_name" value={form.airtel_name} onChange={set('airtel_name')} placeholder="JANE DOE" label="Account Name" />
          </div>
        </div>
      </GlassCard>

      {/* ─── Telegram Bot ────────────────────────────────────── */}
      <GlassCard hover={false} className="space-y-4">
        <SectionHeader icon={Bot} color="bg-sky-500" title="Telegram Bot Notifications" subtitle="Receive alerts for deposits, withdrawals, and new users." />
        <Field label="Bot Token" id="telegram_token" value={form.telegram_token} onChange={set('telegram_token')} placeholder="123456:ABC-DEF..." hint="Get this from @BotFather on Telegram." />
        <Field label="Chat ID" id="telegram_chat_id" value={form.telegram_chat_id} onChange={set('telegram_chat_id')} placeholder="-1001234567890" hint="Your user ID or group/channel ID. Use @userinfobot to find yours." />
        <button onClick={testTelegram} disabled={testing || !form.telegram_token || !form.telegram_chat_id}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-500/40 text-sky-500 text-sm font-medium hover:bg-sky-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Send size={15} /> {testing ? 'Sending…' : 'Send Test Message'}
        </button>
        {testResult === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-500 text-sm">
            <CheckCircle2 size={15} /> Test message sent!
          </motion.div>
        )}
        {testResult === 'error' && <p className="text-rose-500 text-sm">Failed — check your token and chat ID.</p>}
      </GlassCard>

      {/* ─── Support & Admin Access ──────────────────────────── */}
      <GlassCard hover={false} className="space-y-4">
        <SectionHeader icon={Smartphone} color="bg-sky-400" title="Support & Access" subtitle="Support link and admin email list." />
        <Field label="Telegram Support Link" id="support_telegram_link" value={form.support_telegram_link || ''} onChange={set('support_telegram_link')} placeholder="https://t.me/yoursupportusername" hint="Users land here when they tap Support in the sidebar." />
        <Field label="Admin Emails" id="admin_emails" value={form.admin_emails} onChange={set('admin_emails')} placeholder="admin@example.com, another@example.com" hint="Comma-separated. Leave blank to allow any logged-in user (not recommended)." />
      </GlassCard>

      {/* ─── Daily Gift Settings ─────────────────────────────── */}
      <GlassCard hover={false} className="space-y-4">
        <SectionHeader icon={Gift} color="bg-amber-500" title="Daily Gift Settings" subtitle="Gift amount credited when users open the 3:30–4:00 PM gift window." />
        <Field
          label="Gift Amount (UGX)"
          id="daily_gift_amount"
          type="number"
          value={form.daily_gift_amount || '1000'}
          onChange={set('daily_gift_amount')}
          placeholder="1000"
          hint="Amount credited to user wallet when they open the daily gift box. Set 0 to disable gifts."
        />
      </GlassCard>

      {/* Save platform settings */}
      <button onClick={handleSave}
        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all">
        {saved ? <><CheckCircle2 size={18} /> Saved!</> : <><Save size={18} /> Save Platform Settings</>}
      </button>

      {/* ─── Bond Packages ───────────────────────────────────── */}
      <div>
        <SectionHeader icon={BarChart2} color="bg-emerald-600" title="Bond Packages" subtitle="Configure names, prices, returns, cycles and upload images." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bonds.map((bond) => (
            <GlassCard key={bond.id} hover={false} className="overflow-hidden !p-0">
              <div className="relative cursor-pointer group" onClick={() => fileRefs.current[bond.id]?.click()}>
                <input type="file" accept="image/*" className="hidden"
                  ref={(el) => { fileRefs.current[bond.id] = el; }}
                  onChange={(e) => handleBondImageUpload(bond.id, e.target.files[0])} />
                {bondImages[bond.id] ? (
                  <img src={bondImages[bond.id]} alt={bond.name} className="w-full h-24 object-cover" />
                ) : (
                  <div className={`w-full h-24 bg-gradient-to-br ${bond.color} flex flex-col items-center justify-center gap-1`}>
                    <Camera size={18} className="text-white/60" />
                    <span className="text-white/60 text-[10px]">Click to upload image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <Camera size={13} className="text-white" />
                    <span className="text-white text-[11px] font-medium">{bondImages[bond.id] ? 'Change' : 'Upload'}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <input value={bond.name} onChange={(e) => updateBond(bond.id, 'name', e.target.value)} placeholder="Bond name"
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <div className="grid grid-cols-2 gap-2">
                  {[['price', 'Price (UGX)'], ['daily_income', 'Daily Income (UGX)'], ['term', 'Cycle (days)'], ['total_income', 'Total Returns (UGX)']].map(([key, lbl]) => (
                    <div key={key}>
                      <label className="text-[10px] text-muted-foreground">{lbl}</label>
                      <input type="number" value={bond[key]} onChange={(e) => updateBond(bond.id, key, Number(e.target.value))}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
        <button onClick={saveBonds}
          className="mt-4 flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all">
          {bondsSaved ? <><CheckCircle2 size={18} /> Bond Config Saved!</> : <><Save size={18} /> Save Bond Packages</>}
        </button>
      </div>
    </div>
  );
}
