/**
 * 学習用の DES 実装（FIPS 46-3）。途中経過を取り出せるようにしている。
 * 64 ビット値は BigInt で扱う。実運用には使わないこと（DES 自体がすでに安全ではない）。
 */

const IP = [58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7];
const FP = [40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25];
const E = [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1];
const P = [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25];
const PC1 = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4];
const PC2 = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32];
const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
const S = [
  [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7, 0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8, 4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0, 15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10, 3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5, 0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15, 13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8, 13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1, 13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7, 1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15, 13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9, 10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4, 3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9, 14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6, 4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14, 11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11, 10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8, 9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6, 4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1, 13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6, 1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2, 6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7, 1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2, 7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8, 2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
];

/** 入力 inBits ビットの値から、表に従ってビットを並べ替える（表は 1 始まり・左端が 1） */
function permute(v: bigint, table: number[], inBits: number): bigint {
  let o = 0n;
  for (const pos of table) o = (o << 1n) | ((v >> BigInt(inBits - pos)) & 1n);
  return o;
}

const rotl28 = (v: bigint, n: number) => ((v << BigInt(n)) | (v >> BigInt(28 - n))) & 0xfffffffn;

export function subkeys(key: bigint): bigint[] {
  const k56 = permute(key, PC1, 64);
  let c = k56 >> 28n;
  let d = k56 & 0xfffffffn;
  const out: bigint[] = [];
  for (const s of SHIFTS) {
    c = rotl28(c, s);
    d = rotl28(d, s);
    out.push(permute((c << 28n) | d, PC2, 56));
  }
  return out;
}

export interface FDetail {
  expanded: bigint; // E(R) 48 ビット
  xored: bigint; // E(R) xor K 48 ビット
  sboxed: bigint; // S ボックス出力 32 ビット
  out: bigint; // P 置換後 32 ビット
}

export function f(r: bigint, k: bigint): FDetail {
  const expanded = permute(r, E, 32);
  const xored = expanded ^ k;
  let sboxed = 0n;
  for (let i = 0; i < 8; i++) {
    const six = Number((xored >> BigInt(42 - 6 * i)) & 0x3fn);
    const row = ((six & 0x20) >> 4) | (six & 1);
    const col = (six >> 1) & 0xf;
    sboxed = (sboxed << 4n) | BigInt(S[i][row * 16 + col]);
  }
  return { expanded, xored, sboxed, out: permute(sboxed, P, 32) };
}

export interface DesRound {
  round: number;
  l: bigint;
  r: bigint;
  k: bigint;
  f: FDetail;
}

export interface DesTrace {
  ip: bigint;
  l0: bigint;
  r0: bigint;
  rounds: DesRound[];
  preoutput: bigint; // R16 L16
  output: bigint;
}

function run(block: bigint, keys: bigint[]): DesTrace {
  const ip = permute(block, IP, 64);
  let l = ip >> 32n;
  let r = ip & 0xffffffffn;
  const l0 = l;
  const r0 = r;
  const rounds: DesRound[] = [];
  keys.forEach((k, i) => {
    const fd = f(r, k);
    const nr = l ^ fd.out;
    l = r;
    r = nr;
    rounds.push({ round: i + 1, l, r, k, f: fd });
  });
  const preoutput = (r << 32n) | l;
  return { ip, l0, r0, rounds, preoutput, output: permute(preoutput, FP, 64) };
}

export const desEncryptTrace = (block: bigint, key: bigint) => run(block, subkeys(key));
export const desEncrypt = (block: bigint, key: bigint) => desEncryptTrace(block, key).output;
export const desDecrypt = (block: bigint, key: bigint) => run(block, subkeys(key).reverse()).output;

/** 3DES (EDE): C = E_K3(D_K2(E_K1(P))) */
export function tdesEncrypt(block: bigint, k1: bigint, k2: bigint, k3: bigint) {
  const a = desEncrypt(block, k1);
  const b = desDecrypt(a, k2);
  const c = desEncrypt(b, k3);
  return { a, b, c };
}
export function tdesDecrypt(block: bigint, k1: bigint, k2: bigint, k3: bigint) {
  const a = desDecrypt(block, k3);
  const b = desEncrypt(a, k2);
  const c = desDecrypt(b, k1);
  return { a, b, c };
}

export const hex = (v: bigint, bits: number) => v.toString(16).toUpperCase().padStart(bits / 4, '0');
