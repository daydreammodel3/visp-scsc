import type { Viz } from '../protocols/types';

const h2 = (b: number) => b.toString(16).padStart(2, '0');

function Grid({ bytes, changed, label }: { bytes: number[]; changed?: boolean[]; label: string }) {
  return (
    <div className="viz-grid-wrap">
      <span className="viz-grid-label">{label}</span>
      <div className="viz-grid" role="table" aria-label={label}>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="viz-row" role="row">
            {[0, 1, 2, 3].map((c) => {
              const i = r + 4 * c; // 列優先
              return (
                <span key={c} role="cell" className={changed?.[i] ? 'viz-cell changed' : 'viz-cell'}>
                  {h2(bytes[i])}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 暗号の内部状態の図（AES の 4×4 状態、DES の左右半分など） */
export function VizView({ viz, kid }: { viz: Viz; kid: boolean }) {
  if (viz.kind === 'grid') {
    const changed = viz.before ? viz.after.map((b, i) => b !== viz.before![i]) : undefined;
    return (
      <figure className="viz">
        <div className="viz-grids">
          {viz.before && (
            <>
              <Grid bytes={viz.before} label={kid ? 'まえ' : '前'} />
              <span className="viz-arrow" aria-hidden="true">
                →
              </span>
            </>
          )}
          <Grid bytes={viz.after} changed={changed} label={kid ? 'あと' : '後'} />
        </div>
        <figcaption>{viz.caption}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="viz">
      <dl className="viz-rows">
        {viz.rows.map((r) => (
          <div key={r.label} className={r.hl ? 'hl' : undefined}>
            <dt>{r.label}</dt>
            <dd>
              <code>{r.value}</code>
            </dd>
          </div>
        ))}
      </dl>
      {viz.caption && <figcaption>{viz.caption}</figcaption>}
    </figure>
  );
}
