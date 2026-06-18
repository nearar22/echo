import { Plus, CornerDownRight, Sparkles, Waves, CloudOff, Droplets, ExternalLink, Lock } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import { CONTRACT_ADDRESS, DEPLOY_TX, FAUCET, addressUrl, txUrl } from '../lib/contract.js';
import { shortAddr } from '../lib/format.js';

// About / how-to-play. Explains the two-seat blind reveal, the bands, and links
// the contract plus the faucet (one of only two faucet locations).
export default function AboutPanel({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} label="About Echo" size="max-w-2xl">
      <div className="p-6 pt-7">
        <h2 className="font-display text-3xl font-black text-ink">How Echo works</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Echo is a cooperative convergence word game. Two players each choose a single word, blind,
          under a shared connecting prompt, trying to echo each other. An AI judge rules how closely
          the two words converge. The pair wins together by thinking alike.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Step
            icon={Plus}
            tone="bg-magenta text-cream-panel"
            title="Open a round"
            body="Take seat one. Set a connecting prompt and seal a single blind word."
          />
          <Step
            icon={CornerDownRight}
            tone="bg-teal text-ink"
            title="Take seat two"
            body="A second player (a different address) adds their blind word, summoning the judge."
          />
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-ink/80 bg-cream px-4 py-3 text-sm text-ink-soft">
          <Lock size={16} className="mt-0.5 shrink-0 text-magenta-deep" />
          <span>
            Both words stay sealed and hidden while a round is awaiting. They flip face-up together
            only at settlement, so neither player can copy the other.
          </span>
        </div>

        <h3 className="mt-6 font-display text-xl font-extrabold text-ink">The verdict bands</h3>
        <div className="mt-3 space-y-2">
          <Band icon={Sparkles} color="#ff5d8f" name="Match" body="A perfect echo. Tight semantic convergence. A win for the pair." dark />
          <Band icon={Waves} color="#2ad4c0" name="Near" body="A near echo. The words are closely linked. Also a win." />
          <Band icon={CloudOff} color="#b8a6c4" name="Miss" body="The echo faded. The words drifted apart this time." />
        </div>

        <h3 className="mt-6 font-display text-xl font-extrabold text-ink">On chain</h3>
        <div className="mt-2 space-y-1.5 text-sm">
          <a
            href={addressUrl(CONTRACT_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-ink-soft transition hover:text-magenta-deep"
          >
            <ExternalLink size={13} />
            Contract {shortAddr(CONTRACT_ADDRESS)}
          </a>
          <br />
          <a
            href={txUrl(DEPLOY_TX)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-ink-soft transition hover:text-teal-deep"
          >
            <ExternalLink size={13} />
            Deploy tx {shortAddr(DEPLOY_TX)}
          </a>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border-2 border-ink/90 bg-sunflower/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-ink">
            <Droplets size={18} className="text-teal-deep" />
            Need test GEN to play?
          </div>
          <a
            href={FAUCET}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/90 bg-cream-panel px-4 py-2 text-sm font-bold text-ink transition hover:bg-cream-deep"
          >
            Open faucet
          </a>
        </div>
      </div>
    </Modal>
  );
}

function Step({ icon: Icon, tone, title, body }) {
  return (
    <div className="rounded-2xl border-2 border-ink/90 bg-cream-panel p-4 shadow-block-sm">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink/90 ${tone}`}>
        <Icon size={18} />
      </span>
      <p className="mt-3 font-display text-lg font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
    </div>
  );
}

function Band({ icon: Icon, color, name, body, dark }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-ink/90 bg-cream-panel p-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink/90"
        style={{ backgroundColor: color }}
      >
        <Icon size={18} className={dark ? 'text-cream-panel' : 'text-ink'} />
      </span>
      <div>
        <p className="font-display text-base font-bold text-ink">{name}</p>
        <p className="text-sm text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
