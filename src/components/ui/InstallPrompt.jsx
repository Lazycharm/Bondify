import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Share } from 'lucide-react';

const SESSION_KEY = 'bondify_install_dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // Already dismissed this login session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.MSStream);
    setIsIos(ios);

    if (ios) {
      setShow(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setShow(false);
  }

  async function install() {
    if (!deferredPrompt || installing) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        sessionStorage.setItem(SESSION_KEY, '1');
        setShow(false);
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="fixed bottom-[72px] sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-50"
        >
          <div className="glass border border-emerald-500/25 rounded-2xl p-4 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                {isIos ? <Share size={17} className="text-white" /> : <Smartphone size={17} className="text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Install Bondify</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isIos
                    ? <>Tap <span className="text-foreground font-medium">Share</span> → <span className="text-foreground font-medium">Add to Home Screen</span> for the full app experience.</>
                    : 'Get the app — faster, works offline, no browser bars.'}
                </p>

                {!isIos && (
                  <button
                    onClick={install}
                    disabled={installing}
                    className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-60"
                  >
                    <Download size={11} />
                    {installing ? 'Installing…' : 'Install Now'}
                  </button>
                )}
              </div>

              <button
                onClick={dismiss}
                className="shrink-0 mt-0.5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
