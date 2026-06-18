import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, Droplets, ExternalLink, AlertTriangle, Copy, Check } from 'lucide-react';
import { shortAddr } from '../lib/format.js';
import {
  FAUCET,
  NETWORK_NAME,
  addressUrl,
  makeWalletClient,
} from '../lib/contract.js';

// Real MetaMask wallet chip with a dropdown: address + copy, balance, faucet
// link, explorer link, and disconnect. The faucet link lives ONLY here, never
// as a header chip.
export default function WalletButton({ wallet }) {
  const { address, onRightChain, connecting, connect, disconnect, switchChain, error } = wallet;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!address) {
      setBalance(null);
      return undefined;
    }
    (async () => {
      try {
        const client = makeWalletClient(address);
        const raw = await client.getBalance({ address });
        if (!alive) return;
        const gen = Number(raw) / 1e18;
        setBalance(Number.isFinite(gen) ? gen : null);
      } catch {
        if (alive) setBalance(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [address, onRightChain]);

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-end">
        <button
          type="button"
          onClick={connect}
          disabled={connecting}
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink/90 bg-magenta px-4 py-2 text-sm font-bold text-cream-panel transition hover:bg-magenta-soft disabled:opacity-60"
        >
          <Wallet size={16} />
          {connecting ? 'Connecting' : 'Connect wallet'}
        </button>
        {error && <span className="mt-1 text-xs text-magenta-deep">{error}</span>}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border-2 border-ink/90 bg-cream-panel px-3 py-2 text-sm font-semibold text-ink transition hover:bg-cream-deep"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${onRightChain ? 'bg-teal' : 'bg-sunflower'}`}
          style={{ boxShadow: onRightChain ? '0 0 8px #2ad4c0' : '0 0 8px #ffd23f' }}
        />
        <span className="font-mono">{shortAddr(address)}</span>
        <ChevronDown size={14} className="text-ink-faint" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border-2 border-ink/90 bg-cream-panel p-2 shadow-block"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <div className="px-3 py-2">
                <p className="text-xs text-ink-faint">Connected to</p>
                <p className="text-sm font-bold text-ink">{NETWORK_NAME} testnet</p>
              </div>

              <div className="mx-1 mb-1 rounded-xl border-2 border-ink/15 bg-cream px-3 py-2">
                <p className="text-xs text-ink-faint">Balance</p>
                <p className="font-mono text-sm font-semibold text-ink">
                  {balance === null ? '-' : `${balance.toFixed(4)} GEN`}
                </p>
              </div>

              {!onRightChain && (
                <button
                  type="button"
                  onClick={() => {
                    switchChain();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-magenta-deep transition hover:bg-sunflower/30"
                  role="menuitem"
                >
                  <AlertTriangle size={15} />
                  Switch to {NETWORK_NAME}
                </button>
              )}

              <button
                type="button"
                onClick={copyAddr}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-cream-deep hover:text-ink"
                role="menuitem"
              >
                {copied ? <Check size={15} className="text-teal-deep" /> : <Copy size={15} />}
                {copied ? 'Address copied' : 'Copy address'}
              </button>

              <a
                href={addressUrl(address)}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-cream-deep hover:text-ink"
                role="menuitem"
              >
                <ExternalLink size={15} />
                View on explorer
              </a>

              <a
                href={FAUCET}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-cream-deep hover:text-ink"
                role="menuitem"
              >
                <Droplets size={15} />
                Claim test GEN
              </a>

              <div className="my-1 h-0.5 bg-ink/10" />
              <p className="truncate px-3 py-1 font-mono text-xs text-ink-faint">{address}</p>
              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-magenta-deep transition hover:bg-magenta/10"
                role="menuitem"
              >
                <LogOut size={15} />
                Disconnect
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
