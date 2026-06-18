import { motion } from 'framer-motion';
import { CornerDownRight, Clock, Trophy, CloudOff, Eye } from 'lucide-react';
import { bandOf } from '../lib/contract.js';
import { shortAddr } from '../lib/format.js';
import { RoundCardSkeleton } from './Skeleton.jsx';

// The lobby: open rounds you can join, and settled rounds with their revealed
// words and verdicts. Open rounds lead; settled ones follow.
export default function RoundsLobby({ rounds, loading, onJoin, onView, activeId }) {
  if (loading && rounds.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <RoundCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const open = rounds.filter((r) => r.status === 'awaiting');
  const settled = rounds.filter((r) => r.status === 'settled');

  return (
    <div className="space-y-8">
      <section>
        <SectionHeader
          icon={Clock}
          title="Open rounds"
          count={open.length}
          tone="text-magenta-deep"
        />
        {open.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ink/30 bg-cream-panel/60 px-4 py-6 text-center text-sm text-ink-soft">
            No open rounds right now. Open one and leave a seat for another player.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {open.map((r) => (
              <OpenRoundCard key={r.id} round={r} onJoin={onJoin} active={activeId === r.id} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader icon={Trophy} title="Settled rounds" count={settled.length} tone="text-teal-deep" />
        {settled.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ink/30 bg-cream-panel/60 px-4 py-6 text-center text-sm text-ink-soft">
            No settled rounds yet. The first verdict will appear here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {settled.map((r) => (
              <SettledRoundCard key={r.id} round={r} onView={onView} active={activeId === r.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count, tone }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon size={16} className={tone} />
      <h3 className="font-display text-xl font-extrabold text-ink">{title}</h3>
      <span className="font-mono text-sm text-ink-faint">{count}</span>
    </div>
  );
}

function OpenRoundCard({ round, onJoin, active }) {
  return (
    <motion.button
      type="button"
      onClick={() => onJoin(round)}
      layout
      whileHover={{ y: -3 }}
      className={`group flex flex-col rounded-2xl border-2 bg-cream-panel p-4 text-left shadow-block-sm transition ${
        active ? 'border-magenta' : 'border-ink/90 hover:border-magenta'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ink-faint">{round.id}</span>
        <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink/80 bg-sunflower px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
          <Clock size={11} />
          Awaiting
        </span>
      </div>
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] font-display text-lg font-bold leading-tight text-ink">
        {round.prompt}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[11px] text-ink-faint">seat one {shortAddr(round.seatOne)}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal px-3 py-1 text-xs font-bold text-ink transition group-hover:bg-teal-soft">
          <CornerDownRight size={13} />
          Take seat two
        </span>
      </div>
    </motion.button>
  );
}

function SettledRoundCard({ round, onView, active }) {
  const meta = bandOf(round.band);
  const Icon = meta.key === 'miss' ? CloudOff : Trophy;
  return (
    <motion.button
      type="button"
      onClick={() => onView(round)}
      layout
      whileHover={{ y: -3 }}
      className={`group flex flex-col rounded-2xl border-2 bg-cream-panel p-4 text-left shadow-block-sm transition ${
        active ? 'border-teal' : 'border-ink/90 hover:border-teal'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ink-faint">{round.id}</span>
        <span
          className="inline-flex items-center gap-1 rounded-full border-2 border-ink/90 px-2 py-0.5 text-[10px] font-bold uppercase text-ink"
          style={{ backgroundColor: meta.soft }}
        >
          <Icon size={11} />
          {meta.label}
        </span>
      </div>
      <p className="mt-2 line-clamp-1 font-display text-base font-bold text-ink">{round.prompt}</p>

      <div className="mt-3 flex items-center justify-center gap-2">
        <WordChip word={round.wordOne} tone="magenta" />
        <span className="font-mono text-xs text-ink-faint">{round.proximity}</span>
        <WordChip word={round.wordTwo} tone="teal" />
      </div>

      <div className="mt-3 flex items-center justify-end">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft transition group-hover:text-ink">
          <Eye size={13} />
          View verdict
        </span>
      </div>
    </motion.button>
  );
}

function WordChip({ word, tone }) {
  const cls = tone === 'teal' ? 'bg-teal text-ink' : 'bg-magenta text-cream-panel';
  return (
    <span className={`max-w-[40%] truncate rounded-lg border-2 border-ink/90 px-2 py-1 font-display text-sm font-extrabold ${cls}`}>
      {word || '-'}
    </span>
  );
}
