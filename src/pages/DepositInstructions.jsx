import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Copy, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getPaymentSettings } from '@/lib/paymentSettings';
import { addDeposit } from '@/lib/depositStore';
import { formatUGX } from '@/lib/vipData';
import { sendTelegram } from '@/lib/telegramNotify';
import { playSound } from '@/lib/sound';
import { loadPlatformConfigFromSupabase, saveDepositToSupabase } from '@/lib/supabase_ops';

function MTNLogo({ big }) {
  return (
    <div className={`${big ? 'w-32 h-20' : 'w-10 h-7'} rounded-xl bg-yellow-400 flex items-center justify-center`}>
      <span className={`font-black text-black ${big ? 'text-3xl' : 'text-xs'} tracking-tight`}>MTN</span>
    </div>
  );
}

function AirtelLogo({ big }) {
  return (
    <div className={`${big ? 'w-48 h-20' : 'w-10 h-7'} rounded-xl bg-red-600 flex items-center justify-center`}>
      <span className={`font-bold text-white ${big ? 'text-4xl' : 'text-xs'} italic`}>airtel</span>
    </div>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    playSound('click');
  }
  return (
    <div className="flex items-center justify-between gap-3 bg-muted/40 rounded-xl px-4 py-3">
      <div className="min-w-0">
        {label && <p className="text-xs text-muted-foreground mb-0.5">{label}</p>}
        <p className="font-semibold text-sm">{value || '—'}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 hover:bg-emerald-600 transition-colors"
      >
        {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
      </button>
    </div>
  );
}

export default function DepositInstructions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draft, setDraft] = useState(null);
  const [settings, setSettings] = useState({});
  const [sms, setSms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('bondify_deposit_draft');
    if (!raw) { navigate('/dashboard/deposit'); return; }
    const d = JSON.parse(raw);
    if (!d.network) { navigate('/dashboard/deposit/gateway'); return; }
    setDraft(d);
    // Load from localStorage immediately, then sync from Supabase
    setSettings(getPaymentSettings());
    loadPlatformConfigFromSupabase().then((s) => { if (s) setSettings(s); });
  }, []);

  if (!draft) return null;

  const isMtn = draft.network === 'mtn';
  const accountNumber = isMtn ? settings.mtn_number : settings.airtel_number;
  const accountName = isMtn ? settings.mtn_name : settings.airtel_name;

  async function handleSubmit() {
    if (!sms.trim()) { setError('Please enter your payment number or SMS reference.'); return; }
    if (!user?.id) { setError('Session expired. Please refresh the page.'); return; }
    setSubmitting(true);
    setError('');
    try {
      // Supabase is the primary store — no silent fallback
      const saved = await saveDepositToSupabase({
        userId: user.id,
        userEmail: user.email,
        amount: draft.amount,
        network: draft.network,
        userPhone: draft.phone,
        userSms: sms,
      });

      // Mirror to localStorage so balance reads work immediately
      addDeposit({
        userId: user.id,
        userEmail: user.email,
        amount: draft.amount,
        network: draft.network,
        userPhone: draft.phone,
        userSms: sms,
      });

      await sendTelegram(
        `💰 <b>New Deposit Request</b>\n\nUser: ${user.email}\nAmount: UGX ${draft.amount.toLocaleString()}\nNetwork: ${draft.network.toUpperCase()}\nPhone: ${draft.phone}\nRef: ${sms}\nID: ${saved.id}`
      );
      localStorage.removeItem('bondify_deposit_draft');
      playSound('success');
      setDone(true);
    } catch (e) {
      console.error('[Deposit] Supabase save failed:', e);
      setError(e?.message || 'Failed to submit deposit. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto flex flex-col items-center text-center gap-5 py-16"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Deposit Submitted!</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Your deposit of <span className="font-semibold text-foreground">{formatUGX(draft.amount)}</span> is pending approval.
            It will be credited to your wallet within 10–20 minutes once confirmed.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/wallet')}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold"
        >
          Back to Wallet
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="relative bg-white dark:bg-card border border-border rounded-2xl mb-6 overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          {isMtn ? <MTNLogo big /> : <AirtelLogo big />}
        </div>
        <button
          onClick={() => navigate('/dashboard/deposit/gateway')}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        {/* Step 1 */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="font-semibold text-sm">
            <span className="text-emerald-500 mr-2">Step 1</span> Copy account
          </p>
          <CopyField label="Account Number" value={accountNumber} />
          <CopyField label="Account Name" value={accountName} />
        </div>

        {/* Step 2 */}
        <div className="glass rounded-2xl p-5 space-y-2">
          <p className="font-semibold text-sm">
            <span className="text-emerald-500 mr-2">Step 2</span>
            Transfer the amount to the above account through USSD or MoMo.
          </p>
          <p className="text-xs text-rose-500 font-medium">Please do not pay as cash.</p>
          <div className="bg-muted/40 rounded-xl px-4 py-3 mt-2">
            <span className="text-2xl font-black text-rose-500">{draft.amount.toLocaleString()}</span>
            <span className="text-lg font-bold text-muted-foreground ml-2">UGX</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <div>
            <p className="font-semibold text-sm">
              <span className="text-emerald-500 mr-2">Step 3</span>
              After completing the transfer, enter your payment account number or payment SMS reference below.
            </p>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-500 text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={draft.phone || 'Your MoMo number or SMS reference'}
              value={sms}
              onChange={(e) => setSms(e.target.value)}
              className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {submitting ? '...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
