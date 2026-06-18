import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Layers, Trophy, Sparkles } from 'lucide-react';
import DriftField from './components/DriftField.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ConvergenceTable from './components/ConvergenceTable.jsx';
import RoundsLobby from './components/RoundsLobby.jsx';
import OpenRoundPanel from './components/OpenRoundPanel.jsx';
import JoinRoundPanel from './components/JoinRoundPanel.jsx';
import AboutPanel from './components/AboutPanel.jsx';
import EmptyState from './components/EmptyState.jsx';
import { ErrorState, ErrorBoundary } from './components/ErrorState.jsx';
import { TableSkeleton } from './components/Skeleton.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { useWallet } from './hooks/useWallet.js';
import { useEcho } from './hooks/useEcho.js';

function Echo() {
  const wallet = useWallet();
  const { rounds, stats, loading, error, refresh, pausePoll, resumePoll } = useEcho();
  const controls = useMemo(() => ({ pausePoll, resumePoll }), [pausePoll, resumePoll]);

  const [openPanel, setOpenPanel] = useState(false);
  const [joinRound, setJoinRound] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  // The round shown on the main table: the user-focused one, else the freshest.
  const [focusId, setFocusId] = useState(null);
  // Plays the verdict bloom when a round we are watching flips to settled.
  const [justSettledId, setJustSettledId] = useState(null);

  const focusRound = useMemo(() => {
    if (!rounds.length) return null;
    const byId = focusId && rounds.find((r) => r.id === focusId);
    if (byId) return byId;
    // Prefer the newest open round, else the newest round overall.
    return rounds.find((r) => r.status === 'awaiting') || rounds[0];
  }, [rounds, focusId]);

  // Detect settlement of the focused round to fire the burst + flash.
  const focusStatus = focusRound?.status;
  const focusKey = focusRound?.id;
  useEffect(() => {
    if (focusStatus === 'settled' && focusKey) {
      setJustSettledId(focusKey);
      const tm = setTimeout(() => setJustSettledId(null), 2600);
      return () => clearTimeout(tm);
    }
    return undefined;
  }, [focusStatus, focusKey]);

  const handleJoin = useCallback((round) => {
    setFocusId(round.id);
    setJoinRound(round);
  }, []);

  const handleView = useCallback((round) => {
    setFocusId(round.id);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onOpened = useCallback(
    (round) => {
      refresh();
      if (round?.id) setFocusId(round.id);
    },
    [refresh]
  );

  const onAnswered = useCallback(
    (settled) => {
      refresh();
      if (settled?.id) {
        setFocusId(settled.id);
        setJustSettledId(settled.id);
        setTimeout(() => setJustSettledId(null), 2600);
      }
    },
    [refresh]
  );

  const showEmpty = !loading && rounds.length === 0 && !error;

  return (
    <div className="relative flex min-h-screen flex-col">
      <DriftField />
      <Header wallet={wallet} onAbout={() => setAboutOpen(true)} />

      {/* Settlement flash overlay */}
      <AnimatePresence>
        {justSettledId && (
          <motion.div
            key="flash"
            className="pointer-events-none fixed inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{ background: 'radial-gradient(circle at center, rgba(255,210,63,0.5), transparent 60%)' }}
          />
        )}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <StatStrip stats={stats} loading={loading} />

        {/* Mode buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setOpenPanel(true)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink/90 bg-magenta px-6 py-3 text-base font-bold text-cream-panel shadow-block-sm transition hover:bg-magenta-soft"
          >
            <Plus size={18} />
            Open a round
          </button>
          <span className="text-sm text-ink-soft">or take an open seat below</span>
        </div>

        {/* Primary surface: the convergence table */}
        <section className="mt-8">
          {loading && rounds.length === 0 ? (
            <div className="flex justify-center py-10">
              <TableSkeleton />
            </div>
          ) : error && rounds.length === 0 ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : showEmpty ? (
            <EmptyState onOpen={() => setOpenPanel(true)} />
          ) : (
            <ConvergenceTable
              round={focusRound}
              listening={false}
              justSettled={justSettledId === focusRound?.id}
            />
          )}
        </section>

        {/* Table action: if the focused round is open, offer to take seat two */}
        {focusRound?.status === 'awaiting' && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => handleJoin(focusRound)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink/90 bg-teal px-6 py-3 text-base font-bold text-ink shadow-block-sm transition hover:bg-teal-soft"
            >
              <Sparkles size={18} />
              Take seat two on this round
            </button>
          </div>
        )}

        {/* Lobby */}
        {!showEmpty && (
          <section className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <Layers size={18} className="text-ink" />
              <h2 className="font-display text-2xl font-black text-ink">The lobby</h2>
            </div>
            {error && rounds.length > 0 && (
              <p className="mb-3 rounded-xl border-2 border-ink/30 bg-sunflower/20 px-4 py-2 text-sm text-ink-soft">
                {error}
              </p>
            )}
            <RoundsLobby
              rounds={rounds}
              loading={loading}
              onJoin={handleJoin}
              onView={handleView}
              activeId={focusRound?.id}
            />
          </section>
        )}
      </main>

      <Footer />

      {/* Panels */}
      <OpenRoundPanel
        open={openPanel}
        onClose={() => setOpenPanel(false)}
        wallet={wallet}
        controls={controls}
        onConfirmed={onOpened}
      />
      <JoinRoundPanel
        open={!!joinRound}
        onClose={() => setJoinRound(null)}
        wallet={wallet}
        round={joinRound}
        controls={controls}
        onConfirmed={onAnswered}
      />
      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

function StatStrip({ stats, loading }) {
  const items = [
    { icon: Layers, label: 'Rounds', value: stats.rounds, tone: 'text-magenta-deep' },
    { icon: Sparkles, label: 'Settled', value: stats.settled, tone: 'text-teal-deep' },
    { icon: Trophy, label: 'Wins', value: stats.wins, tone: 'text-ink' },
  ];
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border-2 border-ink/90 bg-cream-panel px-4 py-3 text-center shadow-block-sm"
        >
          <div className="flex items-center justify-center gap-1.5 text-ink-soft">
            <it.icon size={14} className={it.tone} />
            <span className="text-xs font-semibold uppercase tracking-wide">{it.label}</span>
          </div>
          <p className="mt-1 font-display text-3xl font-black text-ink font-numeric">
            {loading ? '-' : it.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <Echo />
      </ErrorBoundary>
    </ToastProvider>
  );
}
