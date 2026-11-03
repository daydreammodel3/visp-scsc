import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Protocol } from '../protocols/types';
import { ActorIconShape } from './ActorIcon';
import { PacketBuddyShape } from './PacketBuddy';
import { easeInOut, useTween } from '../lib/useTween';

interface Layout {
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

const WIDE: Layout = { VB_W: 680, GUTTER_L: 150, GUTTER_R: 70, HEADER: 150, ROW: 88, LINE_OFFSET: 62, BUDDY: 58, ACTOR_SCALE: 0.84, compact: false };
const COMPACT: Layout = { VB_W: 400, GUTTER_L: 58, GUTTER_R: 46, HEADER: 124, ROW: 94, LINE_OFFSET: 68, BUDDY: 52, ACTOR_SCALE: 0.7, compact: true };

/** コンテナ幅を監視して、スマホでは縦長のレイアウトに切り替える */
function useLayout(ref: RefObject<HTMLDivElement | null>): Layout {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 560));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return compact ? COMPACT : WIDE;
}

interface Props {
  protocol: Protocol;
  /** 0 = まだ何も送っていない, 1..n = n 番目のステップまで送った */
  current: number;
  onSelect: (index: number) => void;
  travelMs: number;
}

function ArrowHead({ x, y, dir, color }: { x: number; y: number; dir: number; color: string }) {
  return <path d={`M${x} ${y} L${x - dir * 13} ${y - 7.5} L${x - dir * 13} ${y + 7.5} Z`} fill={color} strokeLinejoin="round" />;
}

export function SequenceDiagram({ protocol, current, onSelect, travelMs }: Props) {
  const { actors, steps, phases } = protocol;
  const scrollRef = useRef<HTMLDivElement>(null);
  const L = useLayout(scrollRef);
  const { VB_W, GUTTER_L, GUTTER_R, HEADER, ROW, LINE_OFFSET, BUDDY } = L;

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

  // フェーズの帯（連続する同じフェーズをまとめる）
  const bands = useMemo(() => {
    const out: { phaseId: string; from: number; to: number }[] = [];
    steps.forEach((s, idx) => {
      const i = idx + 1;
      const last = out[out.length - 1];
      if (last && last.phaseId === s.phase) last.to = i;
      else out.push({ phaseId: s.phase, from: i, to: i });
    });
    return out;
  }, [steps]);

  const tRaw = useTween(`${protocol.id}:${current}`, travelMs);
  const t = easeInOut(tRaw);

  // 現在の行が見えるようにスクロール（コンテナ内だけ）
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scale = el.clientWidth / VB_W;
    const target = current === 0 ? 0 : (rowY(current) - ROW * 1.6) * scale;
    el.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, protocol.id, L]);

  return (
    <div className="diagram-scroll" ref={scrollRef}>
      <svg
        viewBox={`0 0 ${VB_W} ${height}`}
        className="diagram"
        role="group"
        aria-label={`${protocol.name} のシーケンス図`}
      >
        {/* フェーズ帯 */}
        {bands.map((b) => {
          const phase = phases.find((p) => p.id === b.phaseId);
          if (!phase) return null;
          const y1 = rowY(b.from) - LINE_OFFSET + 4;
          const y2 = rowY(b.to) - LINE_OFFSET + ROW - 4;
          const reached = current >= b.from;
          return (
            <g key={`${b.phaseId}-${b.from}`} opacity={reached ? 1 : 0.45}>
              <rect x="8" y={y1} width={VB_W - 16} height={y2 - y1} rx="16" fill={phase.color} fillOpacity="0.16" />
              <rect x="8" y={y1} width="8" height={y2 - y1} rx="4" fill={phase.color} />
              {L.compact ? (
                <text x="24" y={y1 + 17} className="phase-inline">
                  {phase.kidName}
                  <tspan className="phase-inline-tech"> {phase.name}</tspan>
                </text>
              ) : (
                <foreignObject x="22" y={y1 + 8} width={GUTTER_L - 64} height={y2 - y1 - 12}>
                  <div className="phase-label">
                    <span className="phase-kid">{phase.kidName}</span>
                    <span className="phase-tech">{phase.name}</span>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {/* 登場人物と生命線 */}
        {actors.map((a) => {
          const x = actorX.get(a.id)!;
          return (
            <g key={a.id}>
              <line x1={x} y1={HEADER - 14} x2={x} y2={height - 20} stroke="#b9b3c7" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
              <g transform={`translate(${x - 50 * L.ACTOR_SCALE} 6) scale(${L.ACTOR_SCALE})`}>
                <ActorIconShape kind={a.icon} />
              </g>
              <text x={x} y={100 * L.ACTOR_SCALE + 26} textAnchor="middle" className="actor-kid">{a.kidName}</text>
              <text x={x} y={100 * L.ACTOR_SCALE + 44} textAnchor="middle" className="actor-tech">{a.name.replace(/（.*）/, '')}</text>
            </g>
          );
        })}

        {/* メッセージ矢印 */}
        {steps.map((s, idx) => {
          const i = idx + 1;
          const x1 = actorX.get(s.from)!;
          const x2 = actorX.get(s.to)!;
          const y = rowY(i);
          const isCurrent = i === current;
          const isPast = i < current;
          const state = isCurrent ? 'current' : isPast ? 'past' : 'future';
          const phase = phases.find((p) => p.id === s.phase);
          const stroke = state === 'future' ? '#cfc9da' : s.encrypted ? '#3aa8d8' : (phase?.color ?? '#888');
          const xEnd = isCurrent ? x1 + (x2 - x1) * t : x2;
          const dir = Math.sign(x2 - x1) || 1;
          const label = `${s.encrypted ? '🔒 ' : ''}${s.message}${s.optional ? ' ※' : ''}`;
          return (
            <g
              key={s.id}
              className={`msg msg-${state}`}
              role="button"
              tabIndex={0}
              aria-label={`${i}手目: ${s.message}`}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(i);
                }
              }}
            >
              <rect x={GUTTER_L - 36} y={y - LINE_OFFSET + 6} width={VB_W - GUTTER_L - GUTTER_R + 72} height={ROW - 10} rx="14" className="msg-hit" />
              <circle cx={Math.min(x1, x2) - 22} cy={y} r="11" className="msg-num" />
              <text x={Math.min(x1, x2) - 22} y={y + 4.5} textAnchor="middle" className="msg-num-text">{i}</text>
              {(isPast || isCurrent) && Math.abs(xEnd - x1) > 4 && (
                <line
                  x1={x1}
                  y1={y}
                  x2={isCurrent && tRaw < 1 ? xEnd : xEnd - dir * 8}
                  y2={y}
                  stroke={stroke}
                  strokeWidth={isCurrent ? 5 : 3.5}
                  strokeLinecap="round"
                  strokeDasharray={s.optional ? '10 7' : undefined}
                />
              )}
              {(isPast || (isCurrent && tRaw >= 1)) && <ArrowHead x={x2} y={y} dir={dir} color={stroke} />}
              {state === 'future' && (
                <line x1={x1} y1={y} x2={x2 - dir * 8} y2={y} stroke={stroke} strokeWidth="2.5" strokeDasharray="3 8" strokeLinecap="round" />
              )}
              {state === 'future' && <ArrowHead x={x2} y={y} dir={dir} color={stroke} />}
              <text x={(x1 + x2) / 2} y={y + 22} textAnchor="middle" className="msg-label">
                {label}
              </text>
            </g>
          );
        })}

        {/* 歩いているパケットキャラ */}
        {current > 0 &&
          (() => {
            const s = steps[current - 1];
            const x1 = actorX.get(s.from)!;
            const x2 = actorX.get(s.to)!;
            const dir = Math.sign(x2 - x1) || 1;
            const x = x1 + dir * BUDDY * 0.2 + (x2 - x1 - dir * BUDDY * 0.75) * t;
            const y = rowY(current);
            const flip = x2 < x1;
            const hop = tRaw < 1 ? Math.abs(Math.sin(tRaw * Math.PI * 6)) * 6 : 0;
            const scale = BUDDY / 100;
            return (
              <g transform={`translate(${x - BUDDY / 2} ${y - BUDDY - 2 - hop})`} pointerEvents="none">
                <g className={tRaw >= 1 ? 'buddy-idle' : undefined}>
                  <g transform={`scale(${scale})${flip ? ' translate(100 0) scale(-1 1)' : ''}`}>
                    <PacketBuddyShape
                      color={s.look.color}
                      accessory={s.look.accessory}
                      encrypted={s.encrypted}
                      walking={tRaw < 1}
                      phase={tRaw * 3}
                    />
                  </g>
                </g>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}
