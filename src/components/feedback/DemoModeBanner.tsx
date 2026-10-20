import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  const handleReset = () => {
    // Clear all demo data from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('frontdesk-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={reducedMotion ? false : { y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 48, opacity: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 300, damping: 25 }
          }
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-sidebar text-white shadow-lg shadow-sidebar/20 text-sm">
            <AlertTriangle size={16} className="text-warning flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              DEMO MODE
            </span>
            <span className="text-white/50 hidden sm:inline">
              — All data is fictional
            </span>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
            >
              <RotateCcw size={12} />
              Reset Demo Data
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss demo banner"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
