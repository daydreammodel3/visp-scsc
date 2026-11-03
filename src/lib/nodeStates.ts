import type { Protocol } from '../protocols/types';

/** current 手目が終わった時点の各ノードの状態と、このステップで変わったかどうか */
export function statesAt(protocol: Protocol, current: number): Record<string, { state: string; changed: boolean }> | null {
  const any = protocol.initialStates || protocol.steps.some((s) => s.states);
  if (!any) return null;
  const out: Record<string, { state: string; changed: boolean }> = {};
  for (const a of protocol.actors) out[a.id] = { state: protocol.initialStates?.[a.id] ?? '—', changed: false };
  protocol.steps.slice(0, current).forEach((s, idx) => {
    for (const [id, st] of Object.entries(s.states ?? {})) out[id] = { state: st, changed: idx === current - 1 };
  });
  return out;
}
