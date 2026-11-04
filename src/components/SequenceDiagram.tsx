import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Protocol } from '../protocols/types';
import { ActorIconShape } from './ActorIcon';
import { PacketBuddyShape } from './PacketBuddy';
import { easeInOut, useTween } from '../lib/useTween';
import { splitName, type Mode } from '../lib/text';

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

const WIDE: Layout = {
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
const COMPACT: Layout = {
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
function useLayout(ref: RefObject<HTMLDivElement | null>): Layout {
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

interface Props {
  protocol: Protocol;
  mode: Mode;
  /** 0 = まだ何も送っていない, 1..n = n 番目のステップまで送った */
  current: number;
  onSelect: (index: number) => void;
  travelMs: number;
}

type TapKind = 'copy' | 'recv' | 'relay';
/** [大人向け, こども向け] */
const TAP_LABEL: Record<TapKind, [string, string]> = {
  copy: ['コピー', 'のぞき見'],
  recv: ['受信', 'とどく'],
  relay: ['転送', 'リレー'],
};

function LostMark({ x, y }: { x: number; y: number }) {
  return (
    <g className="lost-mark">
      <circle cx={x} cy={y} r="11" />
      <path d={`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`} />
    </g>
  );
}

function ArrowHead({ x, y, dir, color }: { x: number; y: number; dir: number; color: string }) {
  return <path d={`M${x} ${y} L${x - dir * 13} ${y - 7.5} L${x - dir * 13} ${y + 7.5} Z`} fill={color} strokeLinejoin="round" />;
}

/** 全角は 1em、半角は 0.6em としたおおよその文字幅 */
function estimateWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) em += /[\u0000-\u00ff]/.test(ch) ? 0.6 : 1;
  return em * fontSize;
}

/** ノードの中での処理（鍵の生成・計算など）。生命線から出て戻る小さなループ */
function SelfStep(props: {
  x: number;
  y: number;
  dir: number;
  state: string;
  color: string;
  label: string;
  grow: number;
  vbWidth: number;
}) {
  const { x, y, dir, state, color, label, grow, vbWidth } = props;
  const w = 30;
  const textX = x + dir * (w + 10);
  // 図の端からはみ出しそうなときは文字幅を詰める
  const room = dir > 0 ? vbWidth - 8 - textX : textX - 8;
  const fit = estimateWidth(label, 15) > room ? room : undefined;
  const visible = state !== 'future';
  return (
    <g>
      <path
        d={`M${x} ${y - 16} H${x + dir * w} V${y + 6} H${x + dir * 9}`}
        fill="none"
        stroke={color}
        strokeWidth={state === 'current' ? 4.5 : state === 'past' ? 3.5 : 2.5}
        strokeDasharray={visible ? undefined : '3 8'}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={visible ? Math.max(0.25, grow) : 1}
      />
      <ArrowHead x={x + 1 * dir} y={y + 6} dir={-dir} color={color} />
      <circle cx={x} cy={y - 5} r="5" fill={visible ? color : '#fff'} stroke={color} strokeWidth="2" />
      <text
        x={textX}
        y={y + 22}
        textAnchor={dir > 0 ? 'start' : 'end'}
        className="msg-label"
        textLength={fit}
        lengthAdjust={fit ? 'spacingAndGlyphs' : undefined}
      >
        {label}
      </text>
    </g>
  );
}

export function SequenceDiagram({ protocol, mode, current, onSelect, travelMs }: Props) {
  const kid = mode === 'kid';
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

  /** ノード内の処理を描く向き: 一番右のノードだけ左へ、それ以外は右へ */
  // ノードが多いときは見出しを小さくして重ならないようにする
  const many = actors.length >= 4;
  const actorScale = many ? L.ACTOR_SCALE * 0.72 : L.ACTOR_SCALE;

  const selfLoopDir = (id: string) => (actors.length > 1 && actors[actors.length - 1].id === id ? -1 : 1);

  const rowY = (i: number) => HEADER + (i - 1) * ROW + LINE_OFFSET; // i は 1 始まり
  const height = HEADER + steps.length * ROW + 40;
  // ここより上（登場人物の見出し）は固定表示し、下だけをスクロールさせる
  const BODY_TOP = HEADER - 10;

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
    const target = current === 0 ? 0 : (rowY(current) - BODY_TOP - ROW * 1.2) * scale;
    el.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, protocol.id, L]);

  return (
    <div className="diagram-wrap">
      {/* 登場人物の見出し（スクロールしても常に見える） */}
      <svg viewBox={`0 0 ${VB_W} ${BODY_TOP}`} className="diagram diagram-head" aria-hidden="true">
        {actors.map((a) => {
          const x = actorX.get(a.id)!;
          const [main, sub] = splitName(a.name);
          const title = kid ? a.kidName : main;
          const caption = kid ? main : sub;
          return (
            <g key={a.id}>
              <line
                x1={x}
                y1={HEADER - 14}
                x2={x}
                y2={BODY_TOP}
                stroke="#b9b3c7"
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
              />
              <g transform={`translate(${x - 50 * actorScale} 6) scale(${actorScale})`}>
                <ActorIconShape kind={a.icon} />
              </g>
              <text x={x} y={100 * actorScale + 26} textAnchor="middle" className={many ? 'actor-kid actor-many' : 'actor-kid'}>
                {title}
              </text>
              <text x={x} y={100 * actorScale + 42} textAnchor="middle" className={many ? 'actor-tech actor-many' : 'actor-tech'}>
                {caption}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="diagram-scroll" ref={scrollRef}>
        <svg
          viewBox={`0 ${BODY_TOP} ${VB_W} ${height - BODY_TOP}`}
          className="diagram"
          role="group"
          aria-label={`${protocol.name} のシーケンス図（${actors.map((a) => (kid ? a.kidName : splitName(a.name)[0])).join('・')}）`}
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
                    {kid ? phase.kidName : phase.name}
                    {kid && <tspan className="phase-inline-tech"> {phase.name}</tspan>}
                  </text>
                ) : (
                  <foreignObject x="22" y={y1 + 8} width={GUTTER_L - 64} height={y2 - y1 - 12}>
                    <div className="phase-label">
                      <span className="phase-kid">{kid ? phase.kidName : phase.name}</span>
                      {kid && <span className="phase-tech">{phase.name}</span>}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* 生命線 */}
          {actors.map((a) => {
            const x = actorX.get(a.id)!;
            return (
              <line
                key={a.id}
                x1={x}
                y1={BODY_TOP}
                x2={x}
                y2={height - 20}
                stroke="#b9b3c7"
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
              />
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
            // 消失したパケットは真ん中で止まる
            const xStop = s.lost ? (x1 + x2) / 2 : x2;
            const xEnd = isCurrent ? x1 + (xStop - x1) * t : xStop;
            const dir = Math.sign(x2 - x1) || 1;
            const label = `${s.danger ? '⚠ ' : ''}${s.encrypted ? '🔒 ' : ''}${s.message}${s.optional ? ' ※' : ''}`;
            const local = s.from === s.to;
            const loopDir = selfLoopDir(s.from);
            // 矢印の途中にいるノードの印: 中継（via）/ ブロードキャストの受信 / 盗み見（gives）
            const between = (id: string) => {
              const x = actorX.get(id);
              return x !== undefined && (x - x1) * (x - x2) < 0;
            };
            const tapMap = new Map<string, TapKind>();
            if (!local) {
              for (const [id, items] of Object.entries(s.gives ?? {}))
                if (id !== s.from && id !== s.to && items.length > 0 && between(id)) tapMap.set(id, 'copy');
              if (s.broadcast) for (const a of actors) if (between(a.id) && !tapMap.has(a.id)) tapMap.set(a.id, 'recv');
              for (const id of s.via ?? []) if (between(id)) tapMap.set(id, 'relay');
            }
            const taps = [...tapMap].map(([id, kind]) => ({ x: actorX.get(id)!, kind }));
            const tapVisible = (x: number) => isPast || (isCurrent && (xEnd - x) * dir >= 0);
            return (
              <g
                key={s.id}
                className={`msg msg-${state}`}
                role="button"
                tabIndex={0}
                aria-label={`${i}: ${s.message} — ${kid ? s.kidTitle : s.summary}`}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelect(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(i);
                  }
                }}
              >
                <rect
                  x={GUTTER_L - 36}
                  y={y - LINE_OFFSET + 6}
                  width={VB_W - GUTTER_L - GUTTER_R + 72}
                  height={ROW - 10}
                  rx="14"
                  className="msg-hit"
                />
                <circle cx={GUTTER_L - 22} cy={y} r="11" className="msg-num" />
                <text x={GUTTER_L - 22} y={y + 4.5} textAnchor="middle" className="msg-num-text">
                  {i}
                </text>
                {local ? (
                  <SelfStep x={x1} y={y} dir={loopDir} state={state} color={stroke} label={label} grow={isCurrent ? t : 1} vbWidth={VB_W} />
                ) : (
                  <>
                    {(isPast || isCurrent) && Math.abs(xEnd - x1) > 4 && (
                      <line
                        x1={x1}
                        y1={y}
                        x2={(isCurrent && tRaw < 1) || s.lost ? xEnd : xEnd - dir * 8}
                        y2={y}
                        stroke={stroke}
                        strokeWidth={isCurrent ? 5 : 3.5}
                        strokeLinecap="round"
                        strokeDasharray={s.optional ? '10 7' : undefined}
                      />
                    )}
                    {(isPast || (isCurrent && tRaw >= 1)) &&
                      (s.lost ? <LostMark x={xStop} y={y} /> : <ArrowHead x={x2} y={y} dir={dir} color={stroke} />)}
                    {state === 'future' && (
                      <line
                        x1={x1}
                        y1={y}
                        x2={x2 - dir * 8}
                        y2={y}
                        stroke={stroke}
                        strokeWidth="2.5"
                        strokeDasharray="3 8"
                        strokeLinecap="round"
                      />
                    )}
                    {state === 'future' && <ArrowHead x={x2} y={y} dir={dir} color={stroke} />}
                    {taps.map(({ x: tx, kind }) =>
                      tapVisible(tx) ? (
                        <g key={tx} className={`tap tap-${kind}`}>
                          <circle cx={tx} cy={y} r="8" />
                          <text x={tx} y={y - 12} textAnchor="middle">
                            {TAP_LABEL[kind][kid ? 1 : 0]}
                          </text>
                        </g>
                      ) : null,
                    )}
                    <text x={(x1 + x2) / 2} y={y + 22} textAnchor="middle" className="msg-label">
                      {label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* 歩いているパケットキャラ */}
          {current > 0 &&
            (() => {
              const s = steps[current - 1];
              const x1 = actorX.get(s.from)!;
              const x2 = actorX.get(s.to)!;
              const local = s.from === s.to;
              const dir = local ? selfLoopDir(s.from) : Math.sign(x2 - x1) || 1;
              const travel = s.lost ? (x2 - x1) / 2 - dir * BUDDY * 0.6 : x2 - x1 - dir * BUDDY * 0.75;
              const x = local ? x1 + dir * (BUDDY * 0.5 + 44) : x1 + dir * BUDDY * 0.2 + travel * t;
              const y = local ? rowY(current) - 12 : rowY(current);
              const flip = local ? dir > 0 : x2 < x1;
              const hop = tRaw < 1 ? (local ? (1 - t) * 26 : Math.abs(Math.sin(tRaw * Math.PI * 6)) * 6) : 0;
              const scale = BUDDY / 100;
              return (
                <g
                  transform={`translate(${x - BUDDY / 2} ${y - BUDDY - 2 - hop})`}
                  pointerEvents="none"
                  opacity={s.lost && tRaw >= 1 ? 0.55 : 1}
                >
                  <g
                    className={tRaw >= 1 && !s.lost ? 'buddy-idle' : undefined}
                    transform={s.lost && tRaw >= 1 ? `rotate(${dir * 80} ${BUDDY / 2} ${BUDDY})` : undefined}
                  >
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
    </div>
  );
}
