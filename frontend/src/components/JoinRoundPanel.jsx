import { useEffect, useMemo, useState } from 'react';
import { Loader2, Wallet, CornerDownRight, Eye, AlertCircle } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import { WordField } from './ui/TextField.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import ConsensusStage from './ConsensusStage.jsx';
import VerdictBurst from './VerdictBurst.jsx';
import SeatTile from './SeatTile.jsx';
import { useAnswerRound } from '../hooks/useAnswerRound.js';
import { useToast } from './Toast.jsx';
import { cleanWord, wordError, sameAddr, shortAddr } from '../lib/format.js';

const MAX_WORD = 40;

// Mode two: JOIN an awaiting round. Seat two adds the second blind word, which
// triggers THE AI consensus write. Seat one cannot fill seat two (the contract
// rejects it, and we guard it here too).
export default function JoinRoundPanel({ open, onClose, wallet, round, controls, onConfirmed }) {
  const toast = useToast();
  const [word, setWord] = useState('');
  const [touched, setTouched] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { state, answer, reset } = useAnswerRound({
    onStart: controls?.pausePoll,
    onSettle: controls?.resumePoll,
    onConfirmed: (settled) => {
      toast.update('answer-round', {
        variant: settled?.band === 'miss' ? 'error' : 'success',
        title: settled?.band === 'miss' ? 'The echo faded' : 'The echo landed',
        message:
          settled?.band === 'miss'
            ? 'Both words are face-up. This pair missed, try another round.'
            : 'Both words flipped face-up. The pair wins together.',
        hash: state.hash,
      });
      onConfirmed?.(settled);
    },
  });

  const isSeatOne = round && wallet.address && sameAddr(round.seatOne, wallet.address);
  const busy = state.phase === 'wallet' || state.phase === 'consensus';
  const wErr = touched ? wordError(word) : null;
  const valid = useMemo(() => !wordError(word), [word]);

  useEffect(() => {
    if (!open) {
      setWord('');
      setTouched(false);
      setConfirmOpen(false);
      reset();
    }
  }, [open, reset]);

  if (!round) return null;

  const requestSubmit = () => {
    setTouched(true);
    if (!valid) return;
    if (!wallet.address) {
      wallet.connect();
      return;
    }
    if (isSeatOne) return;
    setConfirmOpen(true);
  };

  const doSubmit = async () => {
    setConfirmOpen(false);
    toast.push({
      id: 'answer-round',
      variant: 'loading',
      title: 'The judge listens',
      message: 'AI consensus write, one to five minutes. Confirmed from chain state.',
    });
    const ok = await answer(wallet.address, round.id, cleanWord(word));
    if (!ok) {
      toast.update('answer-round', {
        variant: 'error',
        title: 'Verdict not settled',
        message: state.error || 'The answer could not be submitted.',
        onRetry: doSubmit,
      });
    }
  };

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const settled = state.phase === 'confirmed' && state.round;

  return (
    <>
      <Modal open={open} onClose={handleClose} label="Join an open round" size="max-w-xl" dismissable={!busy}>
        <div className="p-6 pt-7">
          <div className="flex items-center gap-2 text-teal-deep">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink/90 bg-teal">
              <CornerDownRight size={18} className="text-ink" />
            </span>
            <h2 className="font-display text-2xl font-extrabold text-ink">Take seat two</h2>
          </div>
          <p className="mt-1.5 text-sm text-ink-soft">
            Round <span className="font-mono">{round.id}</span> opened by{' '}
            <span className="font-mono">{shortAddr(round.seatOne)}</span>. Add your blind word to
            trigger the judge.
          </p>

          <div className="mt-5 rounded-2xl border-2 border-ink/90 bg-cream px-4 py-3 shadow-block-sm">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-magenta-deep">
              Connecting prompt
            </p>
            <p className="mt-1 text-center font-display text-xl font-extrabold text-ink">
              {round.prompt}
            </p>
          </div>

          {settled ? (
            <div className="mt-6 animate-drift-in">
              <div className="flex items-center justify-center gap-4">
                <SeatTile seat="one" state="revealed" word={state.round.wordOne} address={state.round.seatOne} band={state.round.band} tone="magenta" />
                <SeatTile seat="two" state="revealed" word={state.round.wordTwo} address={state.round.seatTwo} band={state.round.band} tone="teal" />
              </div>
              <div className="mt-6">
                <VerdictBurst
                  band={state.round.band}
                  proximity={state.round.proximity}
                  link={state.round.link}
                />
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="mt-6 w-full rounded-full border-2 border-ink/90 bg-teal px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-teal-soft"
              >
                Back to the table
              </button>
            </div>
          ) : busy ? (
            <div className="mt-6 rounded-2xl border-2 border-ink/80 bg-cream p-7">
              <ConsensusStage liveStatus={state.liveStatus} />
            </div>
          ) : isSeatOne ? (
            <div className="mt-6 flex items-start gap-2 rounded-2xl border-2 border-ink/80 bg-sunflower/30 p-4 text-sm text-ink">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-magenta-deep" />
              <span>
                This is your own round. Seat one cannot also fill seat two. Share it with another
                player, or open a different round to answer with a separate address.
              </span>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <WordField
                id="second-word"
                label="Your blind word"
                value={word}
                onChange={setWord}
                max={MAX_WORD}
                error={wErr}
                hint="A single token, no spaces. Try to echo seat one's hidden word under the prompt."
                disabled={busy}
              />
              <div className="flex items-start gap-2 rounded-xl border-2 border-teal/50 bg-teal/10 p-3 text-sm text-ink-soft">
                <Eye size={16} className="mt-0.5 shrink-0 text-teal-deep" />
                <span>
                  Seat one's word is still sealed. Both words flip face-up together only after the
                  judge rules. This write runs AI consensus and can take one to five minutes.
                </span>
              </div>
              <button
                type="button"
                onClick={requestSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/90 bg-teal px-5 py-3 text-sm font-bold text-ink transition hover:bg-teal-soft"
              >
                {!wallet.address ? (
                  <>
                    <Wallet size={16} />
                    Connect wallet to answer
                  </>
                ) : (
                  <>
                    <CornerDownRight size={16} />
                    Seal and summon the judge
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSubmit}
        title="Seal seat two?"
        confirmLabel="Seal and judge"
        tone="teal"
      >
        <p>
          Your sealed word is{' '}
          <span className="font-display text-lg font-black text-teal-deep">{cleanWord(word)}</span>.
        </p>
        <p className="mt-3">
          Sealing it triggers the AI judge, which takes one to five minutes. Both words flip face-up
          together when the verdict lands. The word cannot be changed once sealed.
        </p>
      </ConfirmDialog>
    </>
  );
}
