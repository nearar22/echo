import Modal from './ui/Modal.jsx';
import { AlertTriangle } from 'lucide-react';

// A small confirmation step shown before any write is signed. It restates what
// the player is about to commit (a blind word that cannot be changed) so the
// commitment is deliberate.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  tone = 'magenta',
}) {
  const toneBtn =
    tone === 'teal'
      ? 'bg-teal text-ink hover:bg-teal-soft'
      : 'bg-magenta text-cream-panel hover:bg-magenta-soft';

  return (
    <Modal open={open} onClose={onClose} label={title} size="max-w-md">
      <div className="p-6 pt-7">
        <div className="flex items-center gap-2 text-magenta-deep">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink/80 bg-sunflower">
            <AlertTriangle size={18} className="text-ink" />
          </span>
          <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
        </div>
        <div className="mt-4 text-sm leading-relaxed text-ink-soft">{children}</div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border-2 border-ink/80 bg-cream px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-cream-deep"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-full border-2 border-ink/90 px-5 py-2.5 text-sm font-bold transition ${toneBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
