import { protocols } from '../protocols';

export interface Route {
  protocolId: string;
  step: number;
}

/** "#/tls13/3" → { protocolId: 'tls13', step: 3 } */
export function parseHash(hash: string): Route {
  const [, id, stepStr] = hash.replace(/^#/, '').split('/');
  const protocol = protocols.find((p) => p.id === id) ?? protocols[0];
  const n = Number.parseInt(stepStr ?? '0', 10);
  const step = Number.isFinite(n) ? Math.min(Math.max(n, 0), protocol.steps.length) : 0;
  return { protocolId: protocol.id, step };
}

export function toHash(r: Route): string {
  return `#/${r.protocolId}/${r.step}`;
}
