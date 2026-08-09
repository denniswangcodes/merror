'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 whitespace-nowrap rounded-full bg-surface-raised px-5 py-2.5 text-sm font-semibold text-text-primary shadow-card-hover dark:shadow-card-hover-dark border border-border"
        >
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
