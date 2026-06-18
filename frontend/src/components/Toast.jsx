import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, X, ExternalLink, RefreshCw } from 'lucide-react';
import { txUrl } from '../lib/contract.js';

const ToastCtx = createContext(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const schedule = useCallback(
    (id, ms) => {
      if (!ms) return;
      const tm = setTimeout(() => dismiss(id), ms);
      timers.current.set(id, tm);
    },
    [dismiss]
  );

  const push = useCallback(
    (toast) => {
      counter += 1;
      const id = toast.id ?? `t-${counter}`;
      setToasts((list) => [...list.filter((t) => t.id !== id), { ...toast, id }]);
      // Loading toasts persist until updated; others auto-dismiss.
      if (toast.variant !== 'loading') schedule(id, toast.duration ?? 7000);
      return id;
    },
    [schedule]
  );

  const update = useCallback(
    (id, toast) => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, ...toast, id } : t)));
      const tm = timers.current.get(id);
      if (tm) {
        clearTimeout(tm);
        timers.current.delete(id);
      }
      if (toast.variant && toast.variant !== 'loading') schedule(id, toast.duration ?? 7000);
    },
    [schedule]
  );

  const value = useMemo(() => ({ push, update, dismiss }), [push, update, dismiss]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-5 sm:items-end sm:pr-5"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

const VARIANTS = {
  loading: { icon: Loader2, ring: 'border-teal/50', tint: 'bg-teal/10', text: 'text-teal-deep', spin: true },
  success: { icon: CheckCircle2, ring: 'border-magenta/50', tint: 'bg-magenta/10', text: 'text-magenta-deep' },
  error: { icon: AlertCircle, ring: 'border-ink/30', tint: 'bg-cream-deep', text: 'text-ink' },
};

function ToastCard({ toast, onDismiss }) {
  const meta = VARIANTS[toast.variant] || VARIANTS.loading;
  const Icon = meta.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`pointer-events-auto w-[min(92vw,380px)] rounded-2xl border-2 ${meta.ring} ${meta.tint} bg-cream-panel p-3.5 shadow-block-sm`}
      role={toast.variant === 'error' ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${meta.text}`}>
          <Icon size={18} className={meta.spin ? 'animate-spin' : ''} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight text-ink">{toast.title}</p>
          {toast.message && <p className="mt-0.5 text-sm text-ink-soft">{toast.message}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {toast.hash && (
              <a
                href={txUrl(toast.hash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-deep underline-offset-2 hover:underline"
              >
                <ExternalLink size={13} />
                View transaction
              </a>
            )}
            {toast.onRetry && (
              <button
                type="button"
                onClick={toast.onRetry}
                className="inline-flex items-center gap-1 text-xs font-semibold text-magenta-deep underline-offset-2 hover:underline"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            )}
          </div>
        </div>
        {toast.variant !== 'loading' && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-full p-1 text-ink-faint transition hover:bg-ink/5 hover:text-ink"
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
