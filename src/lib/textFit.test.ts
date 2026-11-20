import { describe, expect, it } from 'vitest';
import { estimateWidth, fitWidth, splitInTwo } from './textFit';

describe('estimateWidth', () => {
  it('全角は 1em、半角は 0.6em で数える', () => {
    expect(estimateWidth('あい', 10)).toBe(20);
    expect(estimateWidth('ab', 10)).toBe(12);
    expect(estimateWidth('TLSで', 10)).toBeCloseTo(28);
  });
});

describe('fitWidth', () => {
  it('収まるときは詰めない（undefined）', () => {
    expect(fitWidth('あい', 10, 20)).toBeUndefined();
  });
  it('はみ出すときは、使える幅を返す', () => {
    expect(fitWidth('あいう', 10, 20)).toBe(20);
  });
});

describe('splitInTwo', () => {
  it('真ん中に近い空白で分ける', () => {
    expect(splitInTwo('ClientHello key_share supported_versions')).toEqual(['ClientHello key_share', 'supported_versions']);
    expect(splitInTwo('a b c d')).toEqual(['a b', 'c d']);
  });
  it('空白がない・先頭だけのときは分けない', () => {
    expect(splitInTwo('ClientHello')).toBeUndefined();
    expect(splitInTwo(' abc')).toBeUndefined();
  });
});
