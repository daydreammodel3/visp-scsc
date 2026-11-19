import { fitWidth } from '../../lib/textFit';
import type { StepState } from './geometry';

/** 途中で消えたパケットの印（×） */
export function LostMark({ x, y }: { x: number; y: number }) {
  return (
    <g className="lost-mark">
      <circle cx={x} cy={y} r="11" />
      <path d={`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`} />
    </g>
  );
}

export function ArrowHead({ x, y, dir, color }: { x: number; y: number; dir: number; color: string }) {
  return <path d={`M${x} ${y} L${x - dir * 13} ${y - 7.5} L${x - dir * 13} ${y + 7.5} Z`} fill={color} strokeLinejoin="round" />;
}

/** ノードの中での処理（鍵の生成・計算など）。生命線から出て戻る小さなループ */
export function SelfStep(props: {
  x: number;
  y: number;
  dir: number;
  state: StepState;
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
  const fit = fitWidth(label, 15, room);
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
