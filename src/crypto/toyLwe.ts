/**
 * ML-KEM（Kyber）の考え方を手計算できる大きさで示す、おもちゃの LWE 暗号（1 ビット）。
 * 本物の ML-KEM は多項式環上で次元 256×k、q = 3329。ここでは整数ベクトル 2 次元、q = 97。
 */

export const Q = 97;
const mod = (x: number) => ((x % Q) + Q) % Q;
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
const matVec = (m: number[][], v: number[]) => m.map((row) => dot(row, v));
const transpose = (m: number[][]) => m[0].map((_, j) => m.map((row) => row[j]));

export interface ToyKeys {
  A: number[][]; // 公開行列
  s: number[]; // 秘密ベクトル（小さい）
  e: number[]; // 誤差（小さい）
  t: number[]; // t = A·s + e mod q
}

export function keygen(A: number[][], s: number[], e: number[]): ToyKeys {
  return { A, s, e, t: matVec(A, s).map((x, i) => mod(x + e[i])) };
}

export interface ToyCipher {
  r: number[];
  e1: number[];
  e2: number;
  m: number;
  u: number[]; // u = Aᵀ·r + e1
  v: number; // v = tᵀ·r + e2 + m·⌊q/2⌋
}

export function encrypt(pk: { A: number[][]; t: number[] }, m: 0 | 1, r: number[], e1: number[], e2: number): ToyCipher {
  const u = matVec(transpose(pk.A), r).map((x, i) => mod(x + e1[i]));
  const v = mod(dot(pk.t, r) + e2 + m * Math.floor(Q / 2));
  return { r, e1, e2, m, u, v };
}

export interface ToyDecrypt {
  w: number; // w = v − sᵀ·u mod q（≒ m·⌊q/2⌋ ＋ 小さな誤差）
  m: 0 | 1;
}

export function decrypt(s: number[], c: { u: number[]; v: number }): ToyDecrypt {
  const w = mod(c.v - dot(s, c.u));
  // 0 と q/2 のどちらに近いか
  const distTo0 = Math.min(w, Q - w);
  const distToHalf = Math.abs(w - Math.floor(Q / 2));
  return { w, m: distToHalf < distTo0 ? 1 : 0 };
}

/** 画面で使う具体例 */
export const EXAMPLE = (() => {
  const keys = keygen(
    [
      [23, 51],
      [8, 77],
    ],
    [2, 3],
    [1, -1],
  );
  const c = encrypt(keys, 1, [1, 2], [1, 0], -1);
  const d = decrypt(keys.s, c);
  return { keys, c, d };
})();
