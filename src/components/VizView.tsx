import type { Viz } from '../protocols/types';

const h2 = (b: number) => b.toString(16).padStart(2, '0');

const SPECTRUM_COLORS = ['#2e86de', '#1dd1a1', '#ff9f43', '#a55eea'];

/** チャネルの重なり。各チャネルを台形で描き、highlight のチャネルだけ色を付ける */
function Spectrum({ viz }: { viz: Extract<Viz, { kind: 'spectrum' }> }) {
  const W = 520;
  const H = 120;
  const pad = 24;
  const step = (W - pad * 2) / (viz.channels - 1 + viz.span);
  const x = (ch: number) => pad + (ch - 1) * step;
  const shape = (ch: number) => {
    const l = x(ch);
    const r = l + viz.span * step;
    const s = step * 0.45;
    return `M${l} ${H - 26} L${l + s} 22 L${r - s} 22 L${r} ${H - 26} Z`;
  };
  return (
    <figure className="viz">
      {viz.title && <p className="viz-spectrum-title">{viz.title}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-spectrum" role="img" aria-label={viz.caption ?? viz.title}>
        {Array.from({ length: viz.channels }, (_, i) => i + 1)
          .filter((ch) => !viz.highlight.includes(ch))
          .map((ch) => (
            <path key={ch} d={shape(ch)} fill="none" stroke="#c9c1b5" strokeWidth="1.2" />
          ))}
        {viz.highlight.map((ch, i) => {
          const c = SPECTRUM_COLORS[i % SPECTRUM_COLORS.length];
          return <path key={ch} d={shape(ch)} fill={c} fillOpacity="0.22" stroke={c} strokeWidth="2.5" />;
        })}
        {Array.from({ length: viz.channels }, (_, i) => i + 1).map((ch) => {
          const hi = viz.highlight.indexOf(ch);
          return (
            <text
              key={ch}
              x={x(ch) + (viz.span * step) / 2}
              y={H - 8}
              textAnchor="middle"
              fontSize="12"
              fontWeight={hi >= 0 ? 800 : 400}
              fill={hi >= 0 ? SPECTRUM_COLORS[hi % SPECTRUM_COLORS.length] : '#8a8494'}
            >
              {ch}
            </text>
          );
        })}
      </svg>
      {viz.caption && <figcaption>{viz.caption}</figcaption>}
    </figure>
  );
}

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
  if (viz.kind === 'bars') {
    const max = Math.max(...viz.rows.map((r) => r.value));
    return (
      <figure className="viz">
        <div className="viz-bars">
          {viz.rows.map((r) => (
            <div key={r.label} className={r.hl ? 'viz-bar hl' : 'viz-bar'}>
              <span className="viz-bar-label">
                <b>{r.label}</b>
                {r.sub && <small>{r.sub}</small>}
              </span>
              <span className="viz-bar-cells" aria-hidden="true">
                {Array.from({ length: max }, (_, i) => (
                  <i key={i} className={i < r.value ? 'on' : undefined} />
                ))}
              </span>
              <span className="viz-bar-value">{r.display ?? r.value}</span>
            </div>
          ))}
        </div>
        {viz.caption && <figcaption>{viz.caption}</figcaption>}
      </figure>
    );
  }
  if (viz.kind === 'spectrum') return <Spectrum viz={viz} />;
  if (viz.kind === 'stacks') {
    // 層の図は大人向けの言葉で書いているので、こども向けでは出さない（下の やさしい 説明で伝える）
    if (kid) return null;
    return (
      <figure className="viz">
        <div className="viz-stacks">
          {viz.stacks.map((st) => (
            <div key={st.title} className="viz-stack">
              <span className="viz-stack-title">{st.title}</span>
              {st.layers.map((l) => (
                <span key={l.label} className={l.hl ? 'viz-layer hl' : 'viz-layer'}>
                  <b>{l.label}</b>
                  {l.note && <small>{l.note}</small>}
                </span>
              ))}
            </div>
          ))}
        </div>
        {viz.caption && <figcaption>{viz.caption}</figcaption>}
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
