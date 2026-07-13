import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Phone, ArrowRight } from 'lucide-react';
import { playSound } from '@/lib/sound';

function MTNLogo() {
  return (
    <div className="w-16 h-10 rounded-lg bg-yellow-400 flex items-center justify-center">
      <span className="font-black text-black text-sm tracking-tight">MTN</span>
    </div>
  );
}

function AirtelLogo() {
  return (
    <div className="w-16 h-10 rounded-lg bg-red-600 flex items-center justify-center">
      <span className="font-bold text-white text-sm italic">airtel</span>
    </div>
  );
}

export default function DepositGateway() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('');
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('bondify_deposit_draft');
    if (!raw) { navigate('/dashboard/deposit'); return; }
    setDraft(JSON.parse(raw));
  }, []);

  function handleNext() {
    if (!phone.trim() || !network) return;
    playSound('click');
    localStorage.setItem('bondify_deposit_draft', JSON.stringify({ ...draft, phone, network }));
    navigate('/dashboard/deposit/instructions');
  }

  return (
    <div className="max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6 overflow-hidden">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Payment</h1>
        </div>
        <button
          onClick={() => navigate('/dashboard/deposit')}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/30 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Phone number */}
        <div>
          <p className="text-sm font-medium mb-2">Your e-wallet number for payment</p>
          <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3.5 focus-within:border-emerald-500 transition-colors bg-background/60">
            <Phone size={16} className="text-muted-foreground" />
            <input
              type="tel"
              placeholder="e.g. 0701 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Network selection */}
        <div>
          <p className="text-sm font-medium mb-3">Select your payment wallet</p>
          <div className="space-y-3">
            {[
              { id: 'mtn', label: 'MTN Money', Logo: MTNLogo },
              { id: 'airtel', label: 'Airtel Money', Logo: AirtelLogo },
            ].map(({ id, label, Logo }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setNetwork(id); playSound('click'); }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  network === id
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-border hover:border-emerald-500/40'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
                  network === id ? 'border-emerald-500' : 'border-muted-foreground/40'
                } flex items-center justify-center`}>
                  {network === id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                </div>
                <Logo />
                <span className="font-semibold text-sm">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={!phone.trim() || !network}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20"
        >
          Next <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
