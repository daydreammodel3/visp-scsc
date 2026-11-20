import { useCallback, useEffect, useState } from 'react';

interface Options {
  current: number;
  total: number;
  goTo: (step: number) => void;
  /** じどう再生で 1 ステップ進む間隔（ミリ秒） */
  interval: number;
  /** false のあいだはキーボード操作を受け付けない（スマホのメニューを開いているときなど） */
  keysEnabled: boolean;
}

/**
 * ステップの再生: じどう再生と、キーボード操作（← → Home End Space）。
 * 入力欄・選択欄にいるときと、Alt / Ctrl / ⌘ を押しているときは、キーボード操作をしない。
 */
export function usePlayback({ current, total, goTo, interval, keysEnabled }: Options) {
  const [playing, setPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // 最後まで進んでいたら、最初から再生する
    if (current >= total) goTo(0);
    setPlaying(true);
  }, [playing, current, total, goTo]);

  /** 再生を止めて、指定したステップへ */
  const jump = (step: number) => {
    setPlaying(false);
    goTo(step);
  };

  // じどう再生（最初の 1 歩だけ早く始める）
  useEffect(() => {
    if (!playing) return;
    if (current >= total) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => goTo(current + 1), current === 0 ? 300 : interval);
    return () => window.clearTimeout(id);
  }, [playing, current, total, interval, goTo]);

  // キーボード操作
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (!keysEnabled) return;
      if (e.key === 'ArrowRight') {
        setPlaying(false);
        goTo(current + 1);
      } else if (e.key === 'ArrowLeft') {
        setPlaying(false);
        goTo(current - 1);
      } else if (e.key === 'Home') {
        setPlaying(false);
        goTo(0);
      } else if (e.key === 'End') {
        setPlaying(false);
        goTo(total);
      } else if (e.key === ' ' && target?.tagName !== 'BUTTON' && target?.getAttribute('role') !== 'button') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, total, goTo, togglePlay, keysEnabled]);

  return { playing, stop: () => setPlaying(false), togglePlay, jump };
}
