/**
 * SCSC シリーズの相互リンク。3 サイト（kmty・visa・visp）で同じ並び・同じ見た目にしている。
 * いま開いているサイトはリンクにせず、太字で示す。
 */
const SITES = [
  { id: 'kmty', name: 'kmty-SCSC', note: 'マウスとキーボードの練習', url: 'https://kmty.yythzy.com/' },
  { id: 'visa', name: 'アルゴリズムずかん', note: 'VISA-SCSC', url: 'https://visa.yythzy.com/' },
  { id: 'visp', name: 'ハンドシェイクずかん', note: 'VISP-SCSC', url: 'https://visp.yythzy.com/' },
] as const;

export function SeriesLinks({ current }: { current: (typeof SITES)[number]['id'] }) {
  return (
    <nav className="series" aria-label="SCSC シリーズのほかのサイト">
      <span className="series-label">SCSC シリーズ</span>
      {SITES.map((s) =>
        s.id === current ? (
          <span key={s.id} aria-current="page" title={s.note}>
            {s.name}
          </span>
        ) : (
          <a key={s.id} href={s.url} title={s.note}>
            {s.name}
          </a>
        ),
      )}
    </nav>
  );
}
