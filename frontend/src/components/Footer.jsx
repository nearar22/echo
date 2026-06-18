import { ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS, DEPLOY_TX, EXPLORER, NETWORK_NAME, addressUrl, txUrl } from '../lib/contract.js';
import { shortAddr } from '../lib/format.js';

// Footer carries the contract identity: address and deploy tx, each linking to
// the explorer. This is where the contract address lives (not a header chip).
export default function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-ink/90 bg-cream-panel">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-xl font-extrabold text-ink">Echo</p>
          <p className="text-sm text-ink-soft">
            An on-chain cooperative convergence word game, judged by AI consensus on GenLayer.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 text-sm sm:items-end">
          <a
            href={addressUrl(CONTRACT_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-ink-soft transition hover:text-magenta-deep"
          >
            <ExternalLink size={13} />
            Contract {shortAddr(CONTRACT_ADDRESS)}
          </a>
          <a
            href={txUrl(DEPLOY_TX)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-ink-soft transition hover:text-teal-deep"
          >
            <ExternalLink size={13} />
            Deploy tx {shortAddr(DEPLOY_TX)}
          </a>
          <span className="text-xs text-ink-faint">{NETWORK_NAME} testnet, {EXPLORER.replace('https://', '')}</span>
        </div>
      </div>
    </footer>
  );
}
