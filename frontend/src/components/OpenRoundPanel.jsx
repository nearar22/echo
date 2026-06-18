import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Plus, Wallet, Eye } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import { WordField, PromptField } from './ui/TextField.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useOpenRound } from '../hooks/useOpenRound.js';
import { useToast } from './Toast.jsx';
import { cleanWord, wordError } from '../lib/format.js';

const MAX_PROMPT = 200;
const MAX_WORD = 40;

// Mode one: open a NEW round with a connecting prompt and your blind word. The
// word is sealed on submit and stays hidden until a second player answers.
export default function OpenRoundPanel({ open, onClose, wallet, controls, onConfirmed }) {
  const toast = useToast();
  const [prompt, setPrompt] = useState('');
  const [word, setWord] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const { state, open: openRound, reset } = useOpenRound({
    onStart: controls?.pausePoll,
    onSettle: controls?.resumePoll,
    onConfirmed: (round) => {
      toast.update('open-round', {
        variant: 'success',
        title: 'Round opened',
        message: 'Your word is sealed. A second player can now answer.',
        hash: state.hash,
      });
      onConfirmed?.(round);
    },
  });

  const busy = state.phase === 'wallet' || state.phase === 'submitting';

  const pErr = touched && !cleanWord(prompt) ? 'A round needs a connecting prompt.' : null;
  const wErr = touched ? wordError(word) : null;
  const valid = useMemo(() => !!cleanWord(prompt) && !wordError(word), [prompt, word]);

  useEffect(() => {
    if (!open) {
      setPrompt('');
      setWord('');
      setTouched(false);
      setConfirmOpen(false);
      reset();
    }
  }, [open, reset]);

  const requestSubmit = () => {
    setTouched(true);
    if (!valid) return;
    if (!wallet.address) {
      wallet.connect();
      return;
    }
    setConfirmOpen(true);
  };

  const doSubmit = async () => {
    setConfirmOpen(false);
    toast.push({
      id: 'open-round',
      variant: 'loading',
      title: 'Opening round',
      message: 'Confirm in your wallet, then the round seals on chain.',
    });
    const ok = await openRound(wallet.address, {
      prompt: cleanWord(prompt),
      firstWord: cleanWord(word),
    });
    if (!ok) {
      toast.update('open-round', {
        variant: 'error',
        title: 'Round not opened',
        message: state.error || 'The round could not be opened.',
        onRetry: doSubmit,
      });
    }
  };

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose} label="Open a new round" size="max-w-lg" dismissable={!busy}>
        <div className="p-6 pt-7">
          <div className="flex items-center gap-2 text-magenta-deep">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink/90 bg-magenta">
              <Plus size={18} className="text-cream-panel" />
            </span>
            <h2 className="font-display text-2xl font-extrabold text-ink">Open a round</h2>
          </div>
          <p className="mt-1.5 text-sm text-ink-soft">
            Take seat one. Set a connecting prompt and seal a single blind word. A second player adds
            theirs, then the judge rules how closely you echo.
          </p>

          {state.phase === 'confirmed' ? (
            <div className="mt-7 rounded-2xl border-2 border-magenta/60 bg-magenta/10 p-6 text-center animate-drift-in">
              <CheckCircle2 className="mx-auto text-magenta-deep" size={36} />
              <p className="mt-3 font-display text-xl font-extrabold text-ink">Round opened</p>
              <p className="mt-1 text-sm text-ink-soft">
                Your word is sealed and hidden until a second player answers.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-5 rounded-full border-2 border-ink/90 bg-magenta px-6 py-2.5 text-sm font-bold text-cream-panel transition hover:bg-magenta-soft"
              >
                Back to the table
              </button>
            </div>
          ) : busy ? (
            <div className="mt-7 flex flex-col items-center rounded-2xl border-2 border-ink/80 bg-cream p-8 text-center">
              <Loader2 size={28} className="animate-spin text-magenta-deep" />
              <p className="mt-4 font-display text-lg font-bold text-ink">
                {state.phase === 'wallet' ? 'Confirm in your wallet' : 'Sealing the round on chain'}
              </p>
              <p className="mt-1.5 max-w-xs text-sm text-ink-soft">
                Confirmed by the on-chain round count rising, so a slow receipt will not lose it.
              </p>
              {state.liveStatus && (
                <span className="mt-4 rounded-full border-2 border-ink/80 bg-cream-panel px-3 py-1 font-mono text-xs text-magenta-deep">
                  {state.liveStatus}
                </span>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <PromptField
                id="prompt"
                label="Connecting prompt"
                value={prompt}
                onChange={setPrompt}
                max={MAX_PROMPT}
                error={pErr}
                hint="What should the two words orbit? Keep it open enough for a real guess."
                disabled={busy}
              />
              <WordField
                id="first-word"
                label="Your blind word"
                value={word}
                onChange={setWord}
                max={MAX_WORD}
                error={wErr}
                hint="A single token, no spaces. It stays sealed until seat two answers."
                disabled={busy}
              />

              <div className="flex items-start gap-2 rounded-xl border-2 border-teal/50 bg-teal/10 p-3 text-sm text-ink-soft">
                <Eye size={16} className="mt-0.5 shrink-0 text-teal-deep" />
                <span>
                  Blind submission: you will not see seat two's word, and they will not see yours,
                  until both flip face-up together at settlement.
                </span>
              </div>

              <button
                type="button"
                onClick={requestSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/90 bg-magenta px-5 py-3 text-sm font-bold text-cream-panel transition hover:bg-magenta-soft"
              >
                {!wallet.address ? (
                  <>
                    <Wallet size={16} />
                    Connect wallet to open
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Open this round
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
        title="Seal your word?"
        confirmLabel="Seal and open"
        tone="magenta"
      >
        <p>
          You are about to open a round on the connecting prompt:
        </p>
        <p className="mt-2 rounded-xl border-2 border-ink/20 bg-cream px-3 py-2 font-display text-lg font-bold text-ink">
          {cleanWord(prompt)}
        </p>
        <p className="mt-3">
          Your sealed word is{' '}
          <span className="font-display text-lg font-black text-magenta-deep">{cleanWord(word)}</span>.
          Once sealed it cannot be changed, and it stays hidden until a second player answers.
        </p>
      </ConfirmDialog>
    </>
  );
}
