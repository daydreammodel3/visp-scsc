import { useEffect, useMemo, useRef } from 'react';
import type { Protocol } from '../protocols/types';
import { useDiagramLayout } from '../hooks/useDiagramLayout';
import { easeInOut, useTween } from '../lib/useTween';
import { splitName, type Mode } from '../lib/text';
import { ActorHeader } from './diagram/ActorHeader';
import type { Geometry } from './diagram/geometry';
import { MessageRow } from './diagram/MessageRow';
import { PhaseBands } from './diagram/PhaseBands';
import { WalkingBuddy } from './diagram/WalkingBuddy';

interface Props {
  protocol: Protocol;
  mode: Mode;
  /** 0 = まだ何も送っていない, 1..n = n 番目のステップまで送った */
  current: number;
  onSelect: (index: number) => void;
  travelMs: number;
}

/**
 * プロトコルのシーケンス図。登場人物（ノード）を横に並べ、ステップを上から順に矢印で描く。
 * 見出しは固定し、本体だけをスクロールする。いまのステップの矢印は、パケットのキャラクターが運ぶ。
 */
export function SequenceDiagram({ protocol, mode, current, onSelect, travelMs }: Props) {
  const kid = mode === 'kid';
  const { actors, steps, phases } = protocol;
  const scrollRef = useRef<HTMLDivElement>(null);
  const L = useDiagramLayout(scrollRef);
  const { VB_W, GUTTER_L, GUTTER_R, HEADER, ROW, LINE_OFFSET } = L;

  const actorX = useMemo(() => {
    const map = new Map<string, number>();
    const span = VB_W - GUTTER_L - GUTTER_R;
    actors.forEach((a, i) => {
      const x = actors.length === 1 ? GUTTER_L + span / 2 : GUTTER_L + (span * i) / (actors.length - 1);
      map.set(a.id, x);
    });
    return map;
  }, [actors, VB_W, GUTTER_L, GUTTER_R]);

  const rowY = (i: number) => HEADER + (i - 1) * ROW + LINE_OFFSET; // i は 1 始まり
  const height = HEADER + steps.length * ROW + 40;
  const bodyTop = HEADER - 10;
  const geo: Geometry = {
    L,
    actorX,
    rowY,
    height,
    bodyTop,
    selfLoopDir: (id) => (actors.length > 1 && actors[actors.length - 1].id === id ? -1 : 1),
  };

  const tRaw = useTween(`${protocol.id}:${current}`, travelMs);
  const t = easeInOut(tRaw);

  // 現在の行が見えるようにスクロール（コンテナ内だけ）
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scale = el.clientWidth / VB_W;
    const target = current === 0 ? 0 : (rowY(current) - bodyTop - ROW * 1.2) * scale;
    el.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, protocol.id, L]);

  return (
    <div className="diagram-wrap">
      <div className="diagram-scroll" ref={scrollRef}>
        <ActorHeader actors={actors} geo={geo} kid={kid} />
        <svg
          viewBox={`0 ${bodyTop} ${VB_W} ${height - bodyTop}`}
          className="diagram"
          role="group"
          aria-label={`${protocol.name} のシーケンス図（${actors.map((a) => (kid ? a.kidName : splitName(a.name)[0])).join('・')}）`}
        >
          <PhaseBands steps={steps} phases={phases} geo={geo} kid={kid} current={current} />

          {/* 生命線 */}
          {actors.map((a) => {
            const x = actorX.get(a.id)!;
            return (
              <line
                key={a.id}
                x1={x}
                y1={bodyTop}
                x2={x}
                y2={height - 20}
                stroke="#b9b3c7"
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
              />
            );
          })}

          {steps.map((s, idx) => (
            <MessageRow
              key={s.id}
              step={s}
              index={idx + 1}
              current={current}
              actors={actors}
              phases={phases}
              geo={geo}
              kid={kid}
              t={t}
              tRaw={tRaw}
              onSelect={onSelect}
            />
          ))}

          {current > 0 && <WalkingBuddy step={steps[current - 1]} current={current} geo={geo} t={t} tRaw={tRaw} />}
        </svg>
      </div>
    </div>
  );
}
