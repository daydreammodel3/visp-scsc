/**
 * 学習用の AES-128 実装（FIPS 197）。各ラウンドの途中経過を取り出せるようにしている。
 * 実運用には使わないこと（定数時間でない・最適化していない）。
 * 状態は FIPS 197 と同じく列優先: state[r + 4c] = 入力バイト[r + 4c]
 */

function buildSbox(): { sbox: number[]; inv: number[] } {
  const sbox = new Array<number>(256);
  const inv = new Array<number>(256);
  let p = 1;
  let q = 1;
  do {
    // p に 3 を掛ける / q を 3 で割る（GF(2^8) 上）
    p = p ^ ((p << 1) & 0xff) ^ (p & 0x80 ? 0x1b : 0);
    q ^= q << 1;
    q ^= q << 2;
    q ^= q << 4;
    q &= 0xff;
    if (q & 0x80) q ^= 0x09;
    const rot = (x: number, s: number) => ((x << s) | (x >> (8 - s))) & 0xff;
    const x = q ^ rot(q, 1) ^ rot(q, 2) ^ rot(q, 3) ^ rot(q, 4) ^ 0x63;
    sbox[p] = x;
    inv[x] = p;
  } while (p !== 1);
  sbox[0] = 0x63;
  inv[0x63] = 0;
  return { sbox, inv };
}

export const { sbox: SBOX, inv: INV_SBOX } = buildSbox();

const xtime = (b: number) => ((b << 1) ^ (b & 0x80 ? 0x1b : 0)) & 0xff;
function gmul(a: number, b: number): number {
  let r = 0;
  while (b) {
    if (b & 1) r ^= a;
    a = xtime(a);
    b >>= 1;
  }
  return r;
}

export type State = number[];

export const subBytes = (s: State): State => s.map((b) => SBOX[b]);
export const invSubBytes = (s: State): State => s.map((b) => INV_SBOX[b]);

/** 行 r を左に r バイト回す */
export function shiftRows(s: State): State {
  const o = new Array<number>(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o[r + 4 * c] = s[r + 4 * ((c + r) % 4)];
  return o;
}
export function invShiftRows(s: State): State {
  const o = new Array<number>(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o[r + 4 * ((c + r) % 4)] = s[r + 4 * c];
  return o;
}

export function mixColumns(s: State): State {
  const o = new Array<number>(16);
  for (let c = 0; c < 4; c++) {
    const [a0, a1, a2, a3] = [s[4 * c], s[4 * c + 1], s[4 * c + 2], s[4 * c + 3]];
    o[4 * c] = gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3;
    o[4 * c + 1] = a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3;
    o[4 * c + 2] = a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3);
    o[4 * c + 3] = gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2);
  }
  return o;
}
export function invMixColumns(s: State): State {
  const o = new Array<number>(16);
  for (let c = 0; c < 4; c++) {
    const [a0, a1, a2, a3] = [s[4 * c], s[4 * c + 1], s[4 * c + 2], s[4 * c + 3]];
    o[4 * c] = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
    o[4 * c + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
    o[4 * c + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
    o[4 * c + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
  }
  return o;
}

export const addRoundKey = (s: State, k: State): State => s.map((b, i) => b ^ k[i]);

/** 鍵拡張: 11 個のラウンド鍵（各 16 バイト） */
export function expandKey(key: number[]): State[] {
  const w: number[][] = [];
  for (let i = 0; i < 4; i++) w.push(key.slice(4 * i, 4 * i + 4));
  let rcon = 1;
  for (let i = 4; i < 44; i++) {
    let t = [...w[i - 1]];
    if (i % 4 === 0) {
      t = [SBOX[t[1]] ^ rcon, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]];
      rcon = xtime(rcon);
    }
    w.push(w[i - 4].map((b, j) => b ^ t[j]));
  }
  const keys: State[] = [];
  for (let r = 0; r < 11; r++) keys.push(w.slice(4 * r, 4 * r + 4).flat());
  return keys;
}

export interface AesTraceStep {
  round: number;
  op: 'input' | 'AddRoundKey' | 'SubBytes' | 'ShiftRows' | 'MixColumns';
  state: State;
}

/** 暗号化の全途中経過 */
export function aesEncryptTrace(input: number[], key: number[]): AesTraceStep[] {
  const ks = expandKey(key);
  const out: AesTraceStep[] = [{ round: 0, op: 'input', state: [...input] }];
  let s = addRoundKey(input, ks[0]);
  out.push({ round: 0, op: 'AddRoundKey', state: s });
  for (let r = 1; r <= 10; r++) {
    s = subBytes(s);
    out.push({ round: r, op: 'SubBytes', state: s });
    s = shiftRows(s);
    out.push({ round: r, op: 'ShiftRows', state: s });
    if (r !== 10) {
      s = mixColumns(s);
      out.push({ round: r, op: 'MixColumns', state: s });
    }
    s = addRoundKey(s, ks[r]);
    out.push({ round: r, op: 'AddRoundKey', state: s });
  }
  return out;
}

export function aesEncrypt(input: number[], key: number[]): number[] {
  const t = aesEncryptTrace(input, key);
  return t[t.length - 1].state;
}

export function aesDecrypt(input: number[], key: number[]): number[] {
  const ks = expandKey(key);
  let s = addRoundKey(input, ks[10]);
  for (let r = 9; r >= 0; r--) {
    s = invShiftRows(s);
    s = invSubBytes(s);
    s = addRoundKey(s, ks[r]);
    if (r !== 0) s = invMixColumns(s);
  }
  return s;
}

export const fromHex = (h: string): number[] => (h.replace(/\s+/g, '').match(/../g) ?? []).map((x) => parseInt(x, 16));
export const toHex = (b: number[], sep = ''): string => b.map((x) => x.toString(16).padStart(2, '0')).join(sep);
