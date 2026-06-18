import { Radio, Info } from 'lucide-react';
import WalletButton from './WalletButton.jsx';
import { NETWORK_NAME } from '../lib/contract.js';

// Brand, a network badge, an about trigger, and the wallet chip. No faucet chip
// here (it lives in the wallet dropdown and about panel only).
export default function Header({ wallet, onAbout }) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink/90 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-ink/90 bg-magenta shadow-block-sm">
            <Radio size={20} className="text-cream-panel" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black leading-none tracking-tight text-ink">
              Echo
            </h1>
            <p className="text-[11px] font-medium text-ink-soft">cooperative convergence</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border-2 border-ink/90 bg-teal px-3 py-1.5 text-xs font-bold text-ink sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-ink/70" />
            {NETWORK_NAME} testnet
          </span>
          <button
            type="button"
            onClick={onAbout}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/90 bg-cream-panel px-3 py-2 text-sm font-semibold text-ink transition hover:bg-sunflower"
          >
            <Info size={15} />
            <span className="hidden sm:inline">About</span>
          </button>
          <WalletButton wallet={wallet} />
        </div>
      </div>
    </header>
  );
}
