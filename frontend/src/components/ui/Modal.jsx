import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

// A centered modal dialog with backdrop, focus trapping basics, Escape to close
// and an accessible role. Used for compose / join / confirm / about surfaces.
export default function Modal({ open, onClose, label, children, size = 'max-w-lg', dismissable = true }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Move focus into the panel.
    const tm = setTimeout(() => {
      const el = panelRef.current?.querySelector(
        'input, textarea, button, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus();
    }, 40);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(tm);
    };
  }, [open, onClose, dismissable]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => dismissable && onClose?.()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            className={`relative w-full ${size} rounded-3xl border-2 border-ink/90 bg-cream-panel shadow-block`}
            initial={{ y: 30, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full border-2 border-ink/80 bg-cream p-1.5 text-ink transition hover:bg-sunflower"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            )}
            <div className="thin-scroll max-h-[88vh] overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
