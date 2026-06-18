import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
import { shortAddr } from '../lib/format.js';
import { bandOf } from '../lib/contract.js';

// One seat of the convergence table. While the round is awaiting, the tile is a
// sealed, concealed word (never showing the word, which the chain hides). At
// settlement it FLIPS face-up to reveal the word. A trembling state is used
// while the judge deliberates.
//
// seat: 'one' | 'two'
// state: 'sealed' | 'empty' | 'revealed' | 'trembling'
export default function SeatTile({
  seat,
  state,
  word,
  address,
  band,
  tone, // 'magenta' | 'teal' | 'sunflower'
  label,
}) {
  const palette =
    tone === 'teal'
      ? { face: 'bg-teal', text: 'text-ink', accent: 'border-teal-deep' }
      : tone === 'sunflower'
      ? { face: 'bg-sunflower', text: 'text-ink', accent: 'border-sunflower-deep' }
      : { face: 'bg-magenta', text: 'text-cream-panel', accent: 'border-magenta-deep' };

  const isRevealed = state === 'revealed';
  const bandMeta = band ? bandOf(band) : null;

  return (
    <div className="flex w-full max-w-[15rem] flex-col items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        <User size={13} />
        {label || (seat === 'one' ? 'Seat one' : 'Seat two')}
      </div>

      <div className="relative aspect-square w-full" style={{ perspective: 1000 }}>
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: 'preserve-3d' }}
          initial={false}
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        >
          {/* Back face: sealed / empty */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-ink/90 shadow-block-sm"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <SealedFace seat={seat} state={state} tone={tone} />
          </div>

          {/* Front face: revealed word */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-ink/90 px-3 shadow-block-sm ${palette.face}`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className={`break-all text-center font-display text-3xl font-black leading-none sm:text-4xl ${palette.text}`}>
              {word || '-'}
            </span>
            {bandMeta && (
              <span className={`mt-2 rounded-full border border-ink/30 px-2 py-0.5 text-[10px] font-bold uppercase ${palette.text}`}>
                {bandMeta.label}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div className="h-4 font-mono text-[11px] text-ink-faint">
        {address ? shortAddr(address) : seat === 'two' ? 'open seat' : ''}
      </div>
    </div>
  );
}

function SealedFace({ seat, state, tone }) {
  const empty = state === 'empty';
  const trembling = state === 'trembling';
  const base =
    tone === 'teal'
      ? 'bg-teal/15'
      : tone === 'sunflower'
      ? 'bg-sunflower/20'
      : 'bg-magenta/15';

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-cream-deep/60 text-ink-faint">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-ink/40">
          <User size={20} />
        </span>
        <span className="text-xs font-semibold">Awaiting a word</span>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 rounded-3xl ${base} ${
        trembling ? 'animate-tremble' : ''
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink/80 bg-cream-panel text-ink">
        <Lock size={20} />
      </span>
      <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
        {trembling ? 'Listening' : 'Sealed'}
      </span>
      <div className="mt-1 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink/30"
          />
        ))}
      </div>
    </div>
  );
}
