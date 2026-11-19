import type { Step } from '../../protocols/types';
import { PacketBuddyShape } from '../PacketBuddy';
import type { Geometry } from './geometry';

interface Props {
  step: Step;
  current: number;
  geo: Geometry;
  t: number;
  tRaw: number;
}

/**
 * いまのステップを運んでいるパケットのキャラクター。
 * 矢印に沿って歩き、着いたら足ぶみする。消失したパケットは途中で倒れる。
 * ノード内の処理では、生命線の横で跳ねる。
 */
export function WalkingBuddy({ step: s, current, geo, t, tRaw }: Props) {
  const { L, actorX, rowY, selfLoopDir } = geo;
  const { BUDDY } = L;
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
    <g transform={`translate(${x - BUDDY / 2} ${y - BUDDY - 2 - hop})`} pointerEvents="none" opacity={s.lost && tRaw >= 1 ? 0.55 : 1}>
      <g
        className={tRaw >= 1 && !s.lost ? 'buddy-idle' : undefined}
        transform={s.lost && tRaw >= 1 ? `rotate(${dir * 80} ${BUDDY / 2} ${BUDDY})` : undefined}
      >
        <g transform={`scale(${scale})${flip ? ' translate(100 0) scale(-1 1)' : ''}`}>
          <PacketBuddyShape color={s.look.color} accessory={s.look.accessory} encrypted={s.encrypted} walking={tRaw < 1} phase={tRaw * 3} />
        </g>
      </g>
    </g>
  );
}
