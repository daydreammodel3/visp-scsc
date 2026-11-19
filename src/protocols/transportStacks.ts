import type { Viz } from './types';

/** HTTP/2 と HTTP/3 のプロトコルスタック。違いがある層を強調する */
export const H2_H3_STACKS: Viz = {
  kind: 'stacks',
  stacks: [
    {
      title: 'HTTP/2',
      layers: [
        { label: 'HTTP/2', note: 'ストリーム多重化・HPACK' },
        { label: 'TLS 1.3', note: 'TLS 1.2 も使える' },
        { label: 'TCP', note: 'ヘッダーは平文', hl: true },
        { label: 'IP' },
      ],
    },
    {
      title: 'HTTP/3',
      layers: [
        { label: 'HTTP/3', note: 'ほぼ同じ意味論・QPACK' },
        { label: 'QUIC ＋ TLS 1.3', note: '暗号とトランスポートが一体・ヘッダーも保護', hl: true },
        { label: 'UDP' },
        { label: 'IP' },
      ],
    },
  ],
  caption: 'HTTP/2 → HTTP/3 の違いは主に速度。セキュリティの違いは 1 段下の「TCP＋TLS → QUIC」から来る（強調した層）',
};
