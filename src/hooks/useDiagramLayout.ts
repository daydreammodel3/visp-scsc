import { useEffect, useState, type RefObject } from 'react';

/** シーケンス図の寸法（SVG の座標） */
export interface DiagramLayout {
  VB_W: number;
  GUTTER_L: number;
  GUTTER_R: number;
  HEADER: number;
  ROW: number;
  /** 行の上端から矢印までの距離 */
  LINE_OFFSET: number;
  BUDDY: number;
  ACTOR_SCALE: number;
  compact: boolean;
}

const WIDE: DiagramLayout = {
  VB_W: 680,
  GUTTER_L: 150,
  GUTTER_R: 70,
  HEADER: 150,
  ROW: 88,
  LINE_OFFSET: 62,
  BUDDY: 58,
  ACTOR_SCALE: 0.84,
  compact: false,
};
const COMPACT: DiagramLayout = {
  VB_W: 400,
  GUTTER_L: 58,
  GUTTER_R: 46,
  HEADER: 124,
  ROW: 94,
  LINE_OFFSET: 68,
  BUDDY: 52,
  ACTOR_SCALE: 0.7,
  compact: true,
};

/** コンテナ幅を監視して、スマホでは縦長のレイアウトに切り替える */
export function useDiagramLayout(ref: RefObject<HTMLDivElement | null>): DiagramLayout {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 480));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return compact ? COMPACT : WIDE;
}
