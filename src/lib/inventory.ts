import type { Protocol } from '../protocols/types';

export interface Holding {
  id: string;
  /** このステップで新しく手に入れたもの */
  fresh: boolean;
}

/** current 手目が終わった時点で、各ノードが持っている持ち物 */
export function inventoryAt(protocol: Protocol, current: number): Record<string, Holding[]> {
  const out: Record<string, Holding[]> = {};
  for (const a of protocol.actors) out[a.id] = [];
  const add = (actor: string, id: string, fresh: boolean) => {
    const list = out[actor];
    if (!list || list.some((h) => h.id === id)) return;
    list.push({ id, fresh });
  };
  for (const [actor, ids] of Object.entries(protocol.initial ?? {})) for (const id of ids) add(actor, id, false);
  protocol.steps.slice(0, current).forEach((step, idx) => {
    const fresh = idx === current - 1;
    for (const [actor, ids] of Object.entries(step.gives ?? {})) for (const id of ids) add(actor, id, fresh);
  });
  return out;
}
