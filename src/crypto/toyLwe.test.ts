import { describe, expect, it } from 'vitest';
import { EXAMPLE, Q, decrypt, encrypt, keygen } from './toyLwe';

describe('おもちゃの LWE', () => {
  it('画面の具体例の値', () => {
    expect(EXAMPLE.keys.t).toEqual([6, 52]);
    expect(EXAMPLE.c.u).toEqual([40, 11]);
    expect(EXAMPLE.c.v).toBe(60);
    expect(EXAMPLE.d.w).toBe(44);
    expect(EXAMPLE.d.m).toBe(1);
  });

  it('小さな誤差なら 0 も 1 も正しく復号できる（総当たり）', () => {
    const k = keygen(
      [
        [23, 51],
        [8, 77],
      ],
      [2, 3],
      [1, -1],
    );
    const small = [-1, 0, 1];
    for (const m of [0, 1] as const)
      for (const r0 of small)
        for (const r1 of small)
          for (const e10 of small)
            for (const e11 of small)
              for (const e2 of small) expect(decrypt(k.s, encrypt(k, m, [r0, r1], [e10, e11], e2)).m).toBe(m);
  });

  it('q は奇素数', () => {
    expect(Q % 2).toBe(1);
  });
});
