import type { Category, Protocol } from './types';
import { symmetric } from './symmetric';
import { rsaKex } from './rsaKex';
import { dh } from './dh';
import { tls12 } from './tls12';
import { tls13 } from './tls13';
import { ipsec } from './ipsec';
import { l2tp } from './l2tp';

/**
 * 左メニューに並ぶカテゴリと、その中のプロトコル。
 * 新しいプロトコルを追加するときは、定義ファイルを作ってここに並べるだけでよい。
 */
export const categories: Category[] = [
  { id: 'crypto', name: '暗号と鍵交換の基礎', kidName: 'あんごうの きほん', protocols: [symmetric, rsaKex, dh] },
  { id: 'secure', name: 'セキュア通信', kidName: 'ひみつの つうしん', protocols: [tls12, tls13] },
  { id: 'vpn', name: 'VPN・トンネル', kidName: 'トンネル', protocols: [ipsec, l2tp] },
];

export const protocols: Protocol[] = categories.flatMap((c) => c.protocols);

export function findProtocol(id: string | undefined): Protocol | undefined {
  return protocols.find((p) => p.id === id);
}

export type { Protocol } from './types';
