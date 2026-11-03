import type { Protocol } from './types';
import { tls12 } from './tls12';
import { tls13 } from './tls13';
import { ipsec } from './ipsec';
import { l2tp } from './l2tp';

/**
 * 対応プロトコルの一覧。
 * 新しいプロトコルを追加するときは、定義ファイルを作ってここに並べるだけで
 * 画面上部の切り替えボタンに表示される。
 */
export const protocols: Protocol[] = [tls12, tls13, ipsec, l2tp];

export function findProtocol(id: string | undefined): Protocol | undefined {
  return protocols.find((p) => p.id === id);
}

export type { Protocol } from './types';
