import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllRounds, fetchStats } from '../lib/contract.js';

// Loads all rounds plus stats and refreshes on a slow 90s interval. The poll
// can be PAUSED during a write so an in-flight AI consensus tx is not disturbed
// by overlapping reads, then resumed (which also triggers an immediate refresh).
export function useEcho(pollMs = 90000) {
  const [rounds, setRounds] = useState([]);
  const [stats, setStats] = useState({ rounds: 0, settled: 0, wins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mounted = useRef(true);
  const paused = useRef(false);

  const load = useCallback(async (quiet = false) => {
    if (paused.current) return;
    if (!quiet) setLoading(true);
    try {
      const [rs, st] = await Promise.all([fetchAllRounds(), fetchStats()]);
      if (!mounted.current) return;
      setRounds(rs);
      setStats(st);
      setError(null);
      setLastUpdated(Date.now());
    } catch (e) {
      if (!mounted.current) return;
      setError('The table could not be read from the chain. Retrying shortly.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load(false);
    const id = setInterval(() => load(true), pollMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [load, pollMs]);

  const pausePoll = useCallback(() => {
    paused.current = true;
  }, []);

  const resumePoll = useCallback(() => {
    paused.current = false;
    load(true);
  }, [load]);

  return {
    rounds,
    stats,
    loading,
    error,
    lastUpdated,
    refresh: () => load(true),
    pausePoll,
    resumePoll,
  };
}
