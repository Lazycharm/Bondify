import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Send, Phone, ChevronDown } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { playSound } from '@/lib/sound';

const FAQ = [
  { q: 'When are withdrawals processed?', a: 'Withdrawals are processed on weekends only (Saturday & Sunday) per platform policy.' },
  { q: 'How do I unlock my registration bonus?', a: 'Your UGX 10,000 bonus becomes withdrawable after depositing at least UGX 20,000 and meeting all platform terms.' },
  { q: 'How do I recharge my wallet?', a: 'Go to the Recharge page, select an amount, and follow the secure payment instructions provided.' },
  { q: 'How do VIP levels work?', a: 'There are 10 VIP levels. Higher levels unlock more daily tasks and higher earnings.' },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Support</h1>
        <p className="text-muted-foreground text-sm">We're here to help. Reach out anytime.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: MessageCircle, label: 'Live Chat', color: 'from-emerald-500 to-teal-600', action: () => playSound('click') },
          { icon: Send, label: 'Telegram', color: 'from-sky-400 to-blue-500', action: () => playSound('click') },
          { icon: Phone, label: 'WhatsApp', color: 'from-green-400 to-green-600', action: () => playSound('click') },
          { icon: Mail, label: 'Email', color: 'from-amber-400 to-orange-500', action: () => playSound('click') },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <MagneticButton onClick={c.action} strength={0.2} className="w-full p-4 rounded-2xl glass flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg`}>
                <c.icon className="text-white" size={22} />
              </div>
              <span className="font-medium text-sm">{c.label}</span>
            </MagneticButton>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <GlassCard hover={false}>
        <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {FAQ.map((f, i) => (
            <div key={i} className="rounded-xl bg-muted/30 overflow-hidden">
              <button
                onClick={() => { setOpenFaq(openFaq === i ? -1 : i); playSound('click'); }}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <span className="text-sm font-medium">{f.q}</span>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                className="overflow-hidden"
              >
                <p className="px-3 pb-3 text-sm text-muted-foreground">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Submit ticket */}
      <GlassCard hover={false}>
        <h3 className="font-semibold mb-4">Submit a Ticket</h3>
        <div className="space-y-3">
          <input placeholder="Subject" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 outline-none text-sm focus:ring-2 ring-emerald-500/30" />
          <textarea placeholder="Describe your issue..." rows={4} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 outline-none text-sm focus:ring-2 ring-emerald-500/30 resize-none" />
          <MagneticButton onClick={() => playSound('success')} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm">
            Submit Ticket
          </MagneticButton>
        </div>
      </GlassCard>
    </div>
  );
}