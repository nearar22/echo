import { useCallback, useRef, useState } from 'react';
import { makeWalletClient, CONTRACT_ADDRESS, fetchStats, fetchAllRounds } from '../lib/contract.js';
import { pollUntilDecided } from '../lib/tx.js';

const INITIAL = { phase: 'idle', liveStatus: '', error: null, round: null, hash: null };

function friendlyError(e) {
  const s = String(e);
  if (/user rejected|denied/i.test(s)) return 'You declined the signature request.';
  if (/LackOfFundForMaxFee|insufficient/i.test(s))
    return 'Wallet balance is below the write fee reserve. Claim test GEN and retry.';
  if (/rate limit|429/i.test(s)) return 'The network is busy. Wait a moment and retry.';
  return 'The round could not be opened. Please retry.';
}

// open_round is deterministic and fast, but the SDK can still throw on the
// receipt while the tx is live, so success is confirmed by the round count
// rising rather than by the writeContract return alone. The caller pauses the
// background poll for the duration via onStart / onSettle.
export function useOpenRound({ onConfirmed, onStart, onSettle } = {}) {
  const [state, setState] = useState(INITIAL);
  const busy = useRef(false);

  const reset = useCallback(() => {
    busy.current = false;
    setState(INITIAL);
  }, []);

  const open = useCallback(
    async (account, { prompt, firstWord }) => {
      if (busy.current) return false;
      busy.current = true;
      onStart?.();
      setState({ ...INITIAL, phase: 'wallet' });

      let baseline = 0;
      try {
        baseline = (await fetchStats()).rounds;
      } catch {
        baseline = 0;
      }

      const client = makeWalletClient(account);
      let hash = null;
      try {
        hash = await client.writeContract({
          address: CONTRACT_ADDRESS,
          functionName: 'open_round',
          args: [prompt, firstWord],
          value: 0n,
        });
      } catch (e) {
        if (/user rejected|denied|LackOfFundForMaxFee|insufficient/i.test(String(e))) {
          setState((s) => ({ ...s, phase: 'error', error: friendlyError(e) }));
          busy.current = false;
          onSettle?.();
          return false;
        }
        // Non-fatal: tx may still be live, fall through to state polling.
      }

      setState((s) => ({ ...s, phase: 'submitting', hash }));

      if (hash) {
        await pollUntilDecided(
          client,
          hash,
          (liveStatus) => setState((s) => ({ ...s, liveStatus })),
          { tries: 40, intervalMs: 4000 }
        );
      }

      for (let i = 0; i < 40; i++) {
        try {
          const stats = await fetchStats();
          if (stats.rounds > baseline) {
            const all = await fetchAllRounds();
            // Newest first from the chain; the freshest open round is index 0.
            const newest = all[0] || null;
            setState((s) => ({ ...s, phase: 'confirmed', round: newest }));
            onConfirmed?.(newest);
            busy.current = false;
            onSettle?.();
            return true;
          }
        } catch {
          /* keep polling */
        }
        await new Promise((r) => setTimeout(r, 4000));
      }

      setState((s) => ({
        ...s,
        phase: 'error',
        error: 'The round did not settle in time. It may still appear shortly.',
      }));
      busy.current = false;
      onSettle?.();
      return false;
    },
    [onConfirmed, onStart, onSettle]
  );

  return { state, open, reset };
}
