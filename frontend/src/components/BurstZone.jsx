import { motion } from 'framer-motion';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import VerdictBurst from './VerdictBurst.jsx';

// The center of the table between the two seats. Its content depends on round
// phase: a quiet connector while awaiting, a spinner while the judge listens,
// or the verdict burst once both words flip.
//
// mode: 'awaiting' | 'listening' | 'verdict'
export default function BurstZone({ mode, band, proximity, link, compact = false }) {
  if (mode === 'verdict') {
    return <VerdictBurst band={band} proximity={proximity} link={link} compact={compact} />;
  }

  if (mode === 'listening') {
    return (
      <div className="flex flex-col items-center gap-2 text-ink-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink/90 bg-sunflower">
          <Loader2 size={24} className="animate-spin text-ink" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide">Listening</span>
      </div>
    );
  }

  // awaiting
  return (
    <div className="flex flex-col items-center gap-2 text-ink-faint">
      <motion.span
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink/80 bg-cream-panel"
        animate={{ x: [-3, 3, -3] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ArrowLeftRight size={20} className="text-ink-soft" />
      </motion.span>
      <span className="text-[11px] font-semibold uppercase tracking-wide">Converge</span>
    </div>
  );
}
