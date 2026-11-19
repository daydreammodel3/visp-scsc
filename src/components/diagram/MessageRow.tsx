import type { Actor, Phase, Step } from '../../protocols/types';
import { estimateWidth, fitWidth, splitInTwo } from '../../lib/textFit';
import { ArrowHead, LostMark, SelfStep } from './Marks';
import type { Geometry, StepState } from './geometry';

type TapKind = 'copy' | 'recv' | 'relay';
/** [大人向け, こども向け] */
const TAP_LABEL: Record<TapKind, [string, string]> = {
  copy: ['コピー', 'のぞき見'],
  recv: ['受信', 'とどく'],
  relay: ['転送', 'リレー'],
};

interface Props {
  step: Step;
  /** 1 始まりのステップ番号 */
  index: number;
  current: number;
  actors: Actor[];
  phases: Phase[];
  geo: Geometry;
  kid: boolean;
  /** いまのステップの矢印の伸び（0〜1、イージング後）と、イージング前の値 */
  t: number;
  tRaw: number;
  onSelect: (index: number) => void;
}

/** 1 つのステップ: 番号・矢印（またはノード内の処理）・ラベル。クリックかキーボードで選べる */
export function MessageRow({ step: s, index: i, current, actors, phases, geo, kid, t, tRaw, onSelect }: Props) {
  const { L, actorX, rowY, selfLoopDir } = geo;
  const { VB_W, GUTTER_L, GUTTER_R, ROW, LINE_OFFSET } = L;

  const x1 = actorX.get(s.from)!;
  const x2 = actorX.get(s.to)!;
  const y = rowY(i);
  const isCurrent = i === current;
  const isPast = i < current;
  const state: StepState = isCurrent ? 'current' : isPast ? 'past' : 'future';
  const phase = phases.find((p) => p.id === s.phase);
  const stroke = state === 'future' ? '#cfc9da' : s.encrypted ? '#3aa8d8' : (phase?.color ?? '#888');
  // 消失したパケットは真ん中で止まる
  const xStop = s.lost ? (x1 + x2) / 2 : x2;
  const xEnd = isCurrent ? x1 + (xStop - x1) * t : xStop;
  const dir = Math.sign(x2 - x1) || 1;
  // こども向けでは技術名の代わりに、ひとことのやさしい言葉を矢印に書く
  const label = `${s.danger ? '⚠ ' : ''}${s.encrypted ? '🔒 ' : ''}${kid ? s.kidTitle : s.message}${s.optional ? ' ※' : ''}`;
  const labelX = (x1 + x2) / 2;
  const labelRoom = 2 * Math.min(labelX, VB_W - labelX) - 12;
  const fitLabel = fitWidth(label, 15, labelRoom);
  // 縮めすぎると読めないので、幅が大きく足りないときは空白で 2 行に分ける
  const twoLines = fitLabel && estimateWidth(label, 15) > labelRoom * 1.25 ? splitInTwo(label) : undefined;
  const local = s.from === s.to;

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
        <SelfStep x={x1} y={y} dir={selfLoopDir(s.from)} state={state} color={stroke} label={label} grow={isCurrent ? t : 1} vbWidth={VB_W} />
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
          {twoLines ? (
            <text x={labelX} y={y + 19} textAnchor="middle" className="msg-label msg-label-2">
              {twoLines.map((ln, k) => {
                const fit = fitWidth(ln, 13, labelRoom);
                return (
                  <tspan key={k} x={labelX} dy={k === 0 ? 0 : 16} textLength={fit} lengthAdjust={fit ? 'spacingAndGlyphs' : undefined}>
                    {ln}
                  </tspan>
                );
              })}
            </text>
          ) : (
            <text
              x={labelX}
              y={y + 22}
              textAnchor="middle"
              className="msg-label"
              textLength={fitLabel}
              lengthAdjust={fitLabel ? 'spacingAndGlyphs' : undefined}
            >
              {label}
            </text>
          )}
        </>
      )}
    </g>
  );
}
