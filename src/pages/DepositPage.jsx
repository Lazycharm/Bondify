import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, ArrowRight, Info } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';
import { getPaymentSettings } from '@/lib/paymentSettings';
import { getTaskFlow } from '@/lib/taskFlowStore';
import { loadPlatformConfigFromSupabase } from '@/lib/supabase_ops';

const BASE_PRESETS = [50000, 120000, 250000, 500000, 1000000, 2500000, 5000000];

export default function DepositPage() {
  const navigate = useNavigate();
  const flow = getTaskFlow();
  const [settings, setSettings] = useState(getPaymentSettings);
  const userInteractedRef = useRef(false);

  const depositMin = parseInt(flow === 'sales' ? (settings.sales_deposit_min || '20000') : (settings.daily_deposit_min || '20000'), 10) || 20000;
  const depositMax = parseInt(flow === 'sales' ? (settings.sales_deposit_max || '0') : (settings.daily_deposit_max || '0'), 10) || 0;
  const presets = [depositMin, ...BASE_PRESETS.filter((a) => a > depositMin)];

  const [selected, setSelected] = useState(depositMin);
  const [custom, setCustom] = useState('');

  useEffect(() => {
    loadPlatformConfigFromSupabase().then((s) => {
      if (!s) return;
      setSettings(s);
      if (!userInteractedRef.current) {
        const newMin = parseInt(flow === 'sales' ? (s.sales_deposit_min || '20000') : (s.daily_deposit_min || '20000'), 10) || 20000;
        setSelected(newMin);
      }
    });
  }, []);

  const amount = custom ? parseInt(custom, 10) : selected;
  const valid = amount && amount >= depositMin && (depositMax === 0 || amount <= depositMax);

  function handleConfirm() {
    if (!valid) return;
    playSound('click');
    localStorage.setItem('bondify_deposit_draft', JSON.stringify({ amount }));
    navigate('/dashboard/deposit/gateway');
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Recharge Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">Add funds to your wallet and start earning daily.</p>
      </div>

      {/* Deposit limits banner */}
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <span className="text-lg">💳</span>
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-400">Minimum Recharge: {formatUGX(depositMin)}</p>
          <p className="text-xs text-muted-foreground">
            {depositMax > 0 ? `Max per deposit: ${formatUGX(depositMax)} · ` : ''}You can start earning from as little as {formatUGX(depositMin)}
          </p>
        </div>
      </div>

      <GlassCard hover={false} className="space-y-5">
        {/* Preset amounts */}
        <div>
          <p className="text-sm font-medium mb-3">Select recharge amount</p>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((amt) => (
              <motion.button
                key={amt}
                whileTap={{ scale: 0.95 }}
                onClick={() => { userInteractedRef.current = true; setSelected(amt); setCustom(''); playSound('click'); }}
                className={`py-2.5 px-1 rounded-xl text-sm font-semibold border transition-all ${
                  selected === amt && !custom
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-border hover:border-emerald-500/50 text-foreground'
                }`}
              >
                {amt >= 1000000 ? `${(amt / 1000000).toLocaleString()}M` : amt >= 1000 ? `${(amt / 1000).toLocaleString()}K` : formatUGX(amt)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <p className="text-sm font-medium mb-2">Enter other amount</p>
          <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3 focus-within:border-emerald-500 transition-colors">
            <span className="text-muted-foreground text-sm font-medium">UGX</span>
            <input
              type="number"
              placeholder="Enter amount"
              value={custom}
              onChange={(e) => { userInteractedRef.current = true; setCustom(e.target.value); setSelected(null); }}
              className="flex-1 bg-transparent outline-none text-sm"
              min={20000}
            />
          </div>
          {amount && amount < depositMin && (
            <p className="text-xs text-rose-500 mt-1">Minimum deposit is {formatUGX(depositMin)}</p>
          )}
          {depositMax > 0 && amount && amount > depositMax && (
            <p className="text-xs text-rose-500 mt-1">Maximum deposit is {formatUGX(depositMax)}</p>
          )}
        </div>

        {/* Payment method */}
        <div>
          <p className="text-sm font-medium mb-2">Recharge method</p>
          <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-emerald-500" />
              <div>
                <p className="text-sm font-semibold">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">Via Fast Pay gateway (MTN / Airtel)</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!valid}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
        >
          {valid ? `Confirm ${formatUGX(amount)}` : amount && amount < depositMin ? `Minimum is ${formatUGX(depositMin)}` : depositMax > 0 && amount && amount > depositMax ? `Maximum is ${formatUGX(depositMax)}` : 'Select Amount to Continue'}
          <ArrowRight size={18} />
        </button>
      </GlassCard>

      {/* Instructions */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p>The minimum recharge amount is {formatUGX(depositMin)}{depositMax > 0 ? ` and maximum is ${formatUGX(depositMax)}` : ''}.</p>
        </div>
        <div className="flex items-start gap-2">
          <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p>Please use the latest account number provided to avoid sending to expired accounts.</p>
        </div>
        <div className="flex items-start gap-2">
          <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p>After completing your transfer, wait 10–20 minutes for your balance to be credited.</p>
        </div>
        <div className="flex items-start gap-2">
          <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p>If your deposit is not credited after 20 minutes, contact support with your payment proof.</p>
        </div>
      </div>
    </div>
  );
}
