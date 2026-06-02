import { useState, useEffect } from 'react';

/**
 * Forces a re-render every `intervalMs` milliseconds so relative timestamps
 * like "2m ago" stay accurate without manual refresh.
 */
export function useTimeTick(intervalMs = 60_000): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return tick;
}
