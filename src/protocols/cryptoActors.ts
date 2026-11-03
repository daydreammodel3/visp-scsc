import type { Actor } from './types';

/** 暗号の基礎で共通の登場人物。イブは通信路の真ん中で盗み聞きする */
export const cryptoActors: Actor[] = [
  { id: 'a', name: 'アリス（送信者）', kidName: 'アリスさん', icon: 'laptop' },
  { id: 'e', name: 'イブ（盗聴者）', kidName: 'のぞき見イブ', icon: 'eve' },
  { id: 'b', name: 'ボブ（受信者）', kidName: 'ボブさん', icon: 'laptop' },
];
