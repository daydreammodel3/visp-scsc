// SVG の文字を、決まった幅に収めるための計算。

/** 全角は 1em、半角は 0.6em としたおおよその文字幅 */
export function estimateWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) em += /[\u0000-ÿ]/.test(ch) ? 0.6 : 1;
  return em * fontSize;
}

/** 幅 room に収まらないときだけ room を返す（SVG の textLength に渡して、文字幅を詰める） */
export function fitWidth(text: string, fontSize: number, room: number): number | undefined {
  return estimateWidth(text, fontSize) > room ? room : undefined;
}

/** いちばん真ん中に近い空白で 2 行に分ける。空白がなければ分けない */
export function splitInTwo(text: string): [string, string] | undefined {
  const mid = text.length / 2;
  let best = -1;
  for (let i = 0; i < text.length; i++) if (text[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best > 0 ? [text.slice(0, best), text.slice(best + 1)] : undefined;
}
