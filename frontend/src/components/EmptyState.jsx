import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

// Crafted empty state: no rounds yet. Two playful tiles lean toward an empty
// center, inviting the player to open the very first round.
export default function EmptyState({ onOpen }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="relative flex h-32 w-full max-w-sm items-center justify-center">
        <motion.div
          className="absolute left-6 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-ink/90 bg-magenta shadow-block-sm sm:left-12"
          animate={{ rotate: [-6, 4, -6], y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-display text-3xl font-black text-cream-panel">?</span>
        </motion.div>
        <motion.div
          className="absolute right-6 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-ink/90 bg-teal shadow-block-sm sm:right-12"
          animate={{ rotate: [6, -4, 6], y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <span className="font-display text-3xl font-black text-ink">?</span>
        </motion.div>
      </div>

      <h2 className="mt-6 font-display text-3xl font-black text-ink sm:text-4xl">
        The table is empty
      </h2>
      <p className="mt-2 max-w-md text-balance text-sm text-ink-soft sm:text-base">
        Echo begins when someone takes seat one. Open the first round with a connecting prompt and a
        single blind word. Then a second player adds theirs, and the judge listens for the echo.
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-7 inline-flex items-center gap-2 rounded-full border-2 border-ink/90 bg-sunflower px-7 py-3 text-base font-bold text-ink shadow-block-sm transition hover:bg-sunflower-soft"
      >
        <Plus size={18} />
        Open the first round
      </button>
    </div>
  );
}
