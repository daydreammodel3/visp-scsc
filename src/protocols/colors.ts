/** パケットキャラの色。役割ごとにそろえておくと、プロトコルをまたいで覚えやすい */
export const C = {
  hello: '#ff9f43',
  hello2: '#feca57',
  key: '#1dd1a1',
  cert: '#54a0ff',
  sign: '#5f27cd',
  setup: '#48dbfb',
  finish: '#ff6b9d',
  data: '#a55eea',
  ack: '#8395a7',
  keepalive: '#f8b500',
  bye: '#576574',
  ticket: '#ee5253',
} as const;

/** フェーズ帯の色 */
export const P = {
  hello: '#ffb347',
  key: '#3ddc97',
  auth: '#6ab0ff',
  switch: '#ff8fb1',
  data: '#b58cff',
  keep: '#ffd166',
  close: '#9aa5b1',
} as const;
