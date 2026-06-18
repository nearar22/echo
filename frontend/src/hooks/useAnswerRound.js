import { useCallback, useRef, useState } from 'react';
import { makeWalletClient, CONTRACT_ADDRESS, fetchRound, fetchStats } from '../lib/contract.js';
import { pollUntilDecided } from '../lib/tx.js';

const INITIAL = { phase: 'idle', liveStatus: '', error: null, round: null, hash: null };

function friendlyError(e) {
  const s = String(e);
  if (/user rejected|denied/i.test(s)) return 'You declined the signature request.';
  if (/LackOfFundForMaxFee|insufficient/i.test(s))
    return 'Wallet balance is below the write fee reserve. Claim test GEN and retry.';
  if (/seat one cannot/i.test(s)) return 'Seat one cannot also fill seat two. Use a different address.';
  if (/no longer open/i.test(s)) return 'This round was answered by someone else first.';
  if (/rate limit|429/i.test(s)) return 'The network is busy. Wait a moment and retry.';
  return 'The answer could not be submitted. Please retry.';
}

// answer_round is THE AI consensus write: it can take one to five minutes while
// validators converge on a closeness band. Success is confirmed by POLLING
// STATE, the target round flipping from awaiting to settled, not by trusting the
// write return. The caller pauses the background poll during the tx.
export function useAnswerRound({ onConfirmed, onStart, onSettle } = {}) {
  const [state, setState] = useState(INITIAL);
  const busy = useRef(false);

  const reset = useCallback(() => {
    busy.current = false;
    setState(INITIAL);
  }, []);

  const answer = useCallback(
    async (account, roundId, secondWord) => {
      if (busy.current) return false;
      busy.current = true;
      onStart?.();
      setState({ ...INITIAL, phase: 'wallet' });

      let settledBaseline = 0;
      try {
        settledBaseline = (await fetchStats()).settled;
      } catch {
        settledBaseline = 0;
      }

      const client = makeWalletClient(account);
      let hash = null;
      try {
        hash = await client.writeContract({
          address: CONTRACT_ADDRESS,
          functionName: 'answer_round',
          args: [roundId, secondWord],
          value: 0n,
        });
      } catch (e) {
        if (/user rejected|denied|LackOfFundForMaxFee|insufficient|seat one cannot|no longer open/i.test(String(e))) {
          setState((s) => ({ ...s, phase: 'error', error: friendlyError(e) }));
          busy.current = false;
          onSettle?.();
          return false;
        }
        // Non-fatal: tx may still be live, fall through to state polling.
      }

      setState((s) => ({ ...s, phase: 'consensus', hash }));

      if (hash) {
        await pollUntilDecided(
          client,
          hash,
          (liveStatus) => setState((s) => ({ ...s, liveStatus })),
          { tries: 80, intervalMs: 8000 }
        );
      }

      // Confirm by the round itself flipping to settled (both words revealed).
      for (let i = 0; i < 80; i++) {
        try {
          const round = await fetchRound(roundId);
          if (round && round.status === 'settled') {
            setState((s) => ({ ...s, phase: 'confirmed', round }));
            onConfirmed?.(round);
            busy.current = false;
            onSettle?.();
            return true;
          }
          const stats = await fetchStats();
          if (stats.settled > settledBaseline) {
            const fresh = await fetchRound(roundId);
            if (fresh && fresh.status === 'settled') {
              setState((s) => ({ ...s, phase: 'confirmed', round: fresh }));
              onConfirmed?.(fresh);
              busy.current = false;
              onSettle?.();
              return true;
            }
          }
        } catch {
          /* keep polling */
        }
        await new Promise((r) => setTimeout(r, 8000));
      }

      setState((s) => ({
        ...s,
        phase: 'error',
        error: 'The judge is taking longer than expected. The verdict may still settle shortly.',
      }));
      busy.current = false;
      onSettle?.();
      return false;
    },
    [onConfirmed, onStart, onSettle]
  );

  return { state, answer, reset };
}
