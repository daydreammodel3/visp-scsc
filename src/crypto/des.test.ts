import { describe, expect, it } from 'vitest';
import { desDecrypt, desEncrypt, desEncryptTrace, hex, subkeys, tdesDecrypt, tdesEncrypt } from './des';

// よく知られた計算例（J. Orlin Grabbe "The DES Algorithm Illustrated"）
const KEY = 0x133457799bbcdff1n;
const PT = 0x0123456789abcdefn;

describe('DES', () => {
  it('暗号文が既知の値になる', () => {
    expect(hex(desEncrypt(PT, KEY), 64)).toBe('85E813540F0AB405');
  });
  it('途中経過が既知の値と一致する', () => {
    const t = desEncryptTrace(PT, KEY);
    expect(hex(t.l0, 32)).toBe('CC00CCFF');
    expect(hex(t.r0, 32)).toBe('F0AAF0AA');
    expect(hex(subkeys(KEY)[0], 48)).toBe('1B02EFFC7072');
    const r1 = t.rounds[0];
    expect(hex(r1.f.expanded, 48)).toBe('7A15557A1555');
    expect(hex(r1.f.xored, 48)).toBe('6117BA866527');
    expect(hex(r1.f.sboxed, 32)).toBe('5C82B597');
    expect(hex(r1.f.out, 32)).toBe('234AA9BB');
    expect(hex(r1.r, 32)).toBe('EF4A6544');
  });
  it('NIST の既知解テスト（鍵 0101..., 平文 8000...）', () => {
    expect(hex(desEncrypt(0x8000000000000000n, 0x0101010101010101n), 64)).toBe('95F8A5E5DD31D900');
  });
  it('復号すると元に戻る', () => {
    expect(desDecrypt(desEncrypt(PT, KEY), KEY)).toBe(PT);
  });
});

describe('3DES (EDE)', () => {
  const K1 = 0x133457799bbcdff1n;
  const K2 = 0x1122334455667788n;
  const K3 = 0x77661100dd223311n;
  it('復号すると元に戻る', () => {
    const { c } = tdesEncrypt(PT, K1, K2, K3);
    expect(tdesDecrypt(c, K1, K2, K3).c).toBe(PT);
  });
  it('K1 = K2 = K3 なら単一 DES と同じ（後方互換）', () => {
    expect(tdesEncrypt(PT, KEY, KEY, KEY).c).toBe(desEncrypt(PT, KEY));
  });
});
