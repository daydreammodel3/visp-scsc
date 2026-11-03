import { useEffect, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** key が変わるたびに 0 → 1 へ進む値を返す（イーズイン・アウト付き） */
export function useTween(key: unknown, duration: number): number {
  const [t, setT] = useState(1);
  useEffect(() => {
    if (prefersReducedMotion() || duration <= 0) {
      setT(1);
      return;
    }
    setT(0);
    let start: number | undefined;
    let raf = 0;
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const p = Math.min(1, (now - start) / duration);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, duration]);
  return t;
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
