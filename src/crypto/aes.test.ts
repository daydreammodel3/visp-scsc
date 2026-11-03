import { describe, expect, it } from 'vitest';
import { SBOX, aesDecrypt, aesEncrypt, aesEncryptTrace, expandKey, fromHex, toHex } from './aes';

// FIPS 197 Appendix B
const KEY = fromHex('2b7e151628aed2a6abf7158809cf4f3c');
const PT = fromHex('3243f6a8885a308d313198a2e0370734');

describe('AES-128', () => {
  it('S-box の代表値', () => {
    expect(SBOX[0x00]).toBe(0x63);
    expect(SBOX[0x53]).toBe(0xed);
    expect(SBOX[0xff]).toBe(0x16);
  });
  it('FIPS 197 Appendix B の暗号文になる', () => {
    expect(toHex(aesEncrypt(PT, KEY))).toBe('3925841d02dc09fbdc118597196a0b32');
  });
  it('FIPS 197 Appendix B の途中経過と一致する', () => {
    const t = aesEncryptTrace(PT, KEY);
    expect(toHex(t[1].state)).toBe('193de3bea0f4e22b9ac68d2ae9f84808'); // 最初の AddRoundKey
    expect(toHex(t[2].state)).toBe('d42711aee0bf98f1b8b45de51e415230'); // R1 SubBytes
    expect(toHex(t[3].state)).toBe('d4bf5d30e0b452aeb84111f11e2798e5'); // R1 ShiftRows
    expect(toHex(t[4].state)).toBe('046681e5e0cb199a48f8d37a2806264c'); // R1 MixColumns
    expect(toHex(t[5].state)).toBe('a49c7ff2689f352b6b5bea43026a5049'); // R1 AddRoundKey
  });
  it('鍵拡張の最終ラウンド鍵（FIPS 197 Appendix A.1）', () => {
    expect(toHex(expandKey(KEY)[10])).toBe('d014f9a8c9ee2589e13f0cc8b6630ca6');
  });
  it('FIPS 197 Appendix C.1 のテストベクタ', () => {
    const k = fromHex('000102030405060708090a0b0c0d0e0f');
    const p = fromHex('00112233445566778899aabbccddeeff');
    expect(toHex(aesEncrypt(p, k))).toBe('69c4e0d86a7b0430d8cdb78070b4c55a');
  });
  it('復号すると元に戻る', () => {
    expect(toHex(aesDecrypt(aesEncrypt(PT, KEY), KEY))).toBe(toHex(PT));
  });
});
