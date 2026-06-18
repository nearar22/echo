import { motion } from 'framer-motion';
import { Ear } from 'lucide-react';
import { statusName } from '../lib/tx.js';

// The 1-5 minute consensus moment, staged. The two sealed tiles tremble (shown
// by the parent) while "the judge listens for the echo". We surface the real
// transaction status name as it churns so the wait feels honest, not fake.
export default function ConsensusStage({ liveStatus }) {
  const status = liveStatus ? statusName(liveStatus) : '';
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-ink/90 bg-sunflower"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Ear size={30} className="text-ink" />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-magenta/60"
          animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-teal/60"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
        />
      </motion.div>

      <p className="mt-5 font-display text-2xl font-black text-ink">The judge listens for the echo</p>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
        Both words are sealed. Validators are converging on how closely they echo. This AI consensus
        can take one to five minutes. You can keep the tab open, the verdict confirms from chain
        state.
      </p>
      {status && (
        <span className="mt-4 rounded-full border-2 border-ink/80 bg-cream px-3 py-1 font-mono text-xs font-semibold text-magenta-deep">
          {status}
        </span>
      )}
    </div>
  );
}
