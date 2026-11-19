import type { Actor } from '../../protocols/types';
import { splitName } from '../../lib/text';
import { fitWidth } from '../../lib/textFit';
import { ActorIconShape } from '../ActorIcon';
import type { Geometry } from './geometry';

interface Props {
  actors: Actor[];
  geo: Geometry;
  kid: boolean;
}

/**
 * 登場人物の見出し（アイコン・名前・説明）。
 * スクロール領域の中で sticky にして、本体と同じ幅（スクロールバーを除いた幅）で描く。
 */
export function ActorHeader({ actors, geo, kid }: Props) {
  const { L, actorX, bodyTop } = geo;
  const { VB_W, GUTTER_L, GUTTER_R, HEADER } = L;
  // ノードが多いときは見出しを小さくして重ならないようにする
  const many = actors.length >= 4;
  const actorScale = many ? L.ACTOR_SCALE * 0.72 : L.ACTOR_SCALE;
  // 見出しの説明文に使える横幅（隣のノードとの間隔）
  const colWidth = actors.length > 1 ? (VB_W - GUTTER_L - GUTTER_R) / (actors.length - 1) - 10 : VB_W - 20;

  return (
    <div className="diagram-head">
      <svg viewBox={`0 0 ${VB_W} ${bodyTop}`} className="diagram" aria-hidden="true">
        {actors.map((a) => {
          const x = actorX.get(a.id)!;
          const [main, sub] = splitName(a.name);
          const title = kid ? a.kidName : main;
          // 見出しの下の説明: 名前と同じなら出さない。狭い画面では「・」より前だけにする
          let caption = kid ? main : sub;
          if (caption === title) caption = undefined;
          if (caption && L.compact) caption = caption.split('・')[0];
          const captionSize = many ? 10 : 12;
          const titleSize = many ? 12.5 : 16;
          // 隣との間隔と、図の端までの距離の両方に収める
          const room = Math.min(colWidth, 2 * Math.min(x, VB_W - x) - 6);
          const fitTitle = fitWidth(title, titleSize, room);
          const fitCaption = caption ? fitWidth(caption, captionSize, room) : undefined;
          return (
            <g key={a.id}>
              <line
                x1={x}
                y1={HEADER - 14}
                x2={x}
                y2={bodyTop}
                stroke="#b9b3c7"
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
              />
              <g transform={`translate(${x - 50 * actorScale} 6) scale(${actorScale})`}>
                <ActorIconShape kind={a.icon} />
              </g>
              <text
                x={x}
                y={100 * actorScale + 26}
                textAnchor="middle"
                className={many ? 'actor-kid actor-many' : 'actor-kid'}
                textLength={fitTitle}
                lengthAdjust={fitTitle ? 'spacingAndGlyphs' : undefined}
              >
                {title}
              </text>
              <text
                x={x}
                y={100 * actorScale + 42}
                textAnchor="middle"
                className={many ? 'actor-tech actor-many' : 'actor-tech'}
                textLength={fitCaption}
                lengthAdjust={fitCaption ? 'spacingAndGlyphs' : undefined}
              >
                {caption}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
