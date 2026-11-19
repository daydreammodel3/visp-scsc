import type { InsightGroup } from '../protocols/types';
import type { Mode } from '../lib/text';
import { VizView } from './VizView';

/** ステップにならない解説（なぜ安全か・トレードオフ・実演など）をカードで並べる */
export function InsightPanel({ groups, mode }: { groups?: InsightGroup[]; mode: Mode }) {
  const kid = mode === 'kid';
  const shown = (groups ?? []).filter((g) => !kid || g.kidHeading);
  if (shown.length === 0) return null;
  return (
    <div className="insights">
      {shown.map((g) => (
        <section key={g.id} className="insight-group" aria-label={kid ? g.kidHeading : g.heading}>
          <h3>{kid ? g.kidHeading : g.heading}</h3>
          {g.viz && <VizView viz={g.viz} kid={kid} />}
          <div className="insight-cards">
            {g.items.map((it) => {
              const vs = kid ? (it.kidVs ?? it.vs) : it.vs;
              return (
                <article key={it.title} className="insight">
                  <h4>{kid ? (it.kidTitle ?? it.title) : it.title}</h4>
                  <p>{kid ? (it.kidBody ?? it.body) : it.body}</p>
                  {it.code && <code className="insight-code">{it.code}</code>}
                  {vs && <p className="insight-vs">{vs}</p>}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
