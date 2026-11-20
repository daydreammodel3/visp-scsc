import type { DiagramLayout } from '../../hooks/useDiagramLayout';

/** シーケンス図の各部品が共有する座標 */
export interface Geometry {
  L: DiagramLayout;
  /** ノード ID → 生命線の x 座標 */
  actorX: Map<string, number>;
  /** i 番目（1 始まり）のステップの矢印の y 座標 */
  rowY: (i: number) => number;
  /** 図全体の高さ */
  height: number;
  /** ここより上（登場人物の見出し）は固定表示し、下だけをスクロールさせる */
  bodyTop: number;
  /** ノード内の処理を描く向き: 一番右のノードだけ左へ、それ以外は右へ */
  selfLoopDir: (id: string) => number;
}

export type StepState = 'current' | 'past' | 'future';
