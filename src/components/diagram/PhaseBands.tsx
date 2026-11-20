import { useMemo } from 'react';
import type { Phase, Step } from '../../protocols/types';
import type { Geometry } from './geometry';

interface Props {
  steps: Step[];
  phases: Phase[];
  geo: Geometry;
  kid: boolean;
  current: number;
}

/** フェーズの帯。連続する同じフェーズのステップを 1 本の帯にまとめ、まだ進んでいない帯は薄くする */
export function PhaseBands({ steps, phases, geo, kid, current }: Props) {
  const { L, rowY } = geo;
  const { VB_W, GUTTER_L, ROW, LINE_OFFSET } = L;

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

  return (
    <>
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
    </>
  );
}
