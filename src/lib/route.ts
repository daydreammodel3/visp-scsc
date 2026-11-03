import { protocols } from '../protocols';
import { comparePresets, presetProtocols } from '../protocols/compare';

export interface Route {
  protocolId: string;
  step: number;
  /** 比較表示のときのプリセット ID */
  compareId?: string;
}

function clampStep(stepStr: string | undefined, max: number): number {
  const n = Number.parseInt(stepStr ?? '0', 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
}

/** 比較表示のステップ数（左右の長いほう） */
export function compareLength(compareId: string): number {
  const preset = comparePresets.find((p) => p.id === compareId);
  if (!preset) return 0;
  const [a, b] = presetProtocols(preset);
  return Math.max(a.steps.length, b.steps.length);
}

/** "#/tls13/3" → { protocolId: 'tls13', step: 3 }、"#/compare/tls/2" → 比較表示 */
export function parseHash(hash: string): Route {
  const [, id, a, b] = hash.replace(/^#/, '').split('/');
  if (id === 'compare') {
    const preset = comparePresets.find((p) => p.id === a);
    if (preset) return { protocolId: preset.left, compareId: preset.id, step: clampStep(b, compareLength(preset.id)) };
  }
  const protocol = protocols.find((p) => p.id === id) ?? protocols[0];
  return { protocolId: protocol.id, step: clampStep(a, protocol.steps.length) };
}

export function toHash(r: Route): string {
  return r.compareId ? `#/compare/${r.compareId}/${r.step}` : `#/${r.protocolId}/${r.step}`;
}
