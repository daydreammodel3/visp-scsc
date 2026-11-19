import type { ComparePreset } from '../protocols/compare';
import { metrics, presetProtocols } from '../protocols/compare';
import type { Protocol } from '../protocols/types';
import type { Mode } from '../lib/text';
import { SequenceDiagram } from './SequenceDiagram';
import { VizView } from './VizView';

interface Props {
  preset: ComparePreset;
  step: number;
  mode: Mode;
  travelMs: number;
  onSelect: (step: number) => void;
  onOpen: (protocolId: string, step: number) => void;
}

function Side({ protocol, step, mode, travelMs, onSelect, onOpen }: { protocol: Protocol } & Omit<Props, 'preset'>) {
  const kid = mode === 'kid';
  const cur = Math.min(step, protocol.steps.length);
  const s = cur > 0 ? protocol.steps[cur - 1] : undefined;
  const done = step >= protocol.steps.length;
  return (
    <section className="panel compare-side" aria-label={protocol.name}>
      <header className="compare-head">
        <h2>{protocol.name}</h2>
        <button type="button" className="see-link compare-open" onClick={() => onOpen(protocol.id, cur)}>
          {kid ? 'ひらく →' : '単独で開く →'}
        </button>
      </header>
      <div className="compare-now" aria-live="polite">
        {s ? (
          <>
            <span className="compare-step">
              {cur} / {protocol.steps.length}
              {done && step > protocol.steps.length ? (kid ? '（おわり）' : '（完了）') : ''}
            </span>
            {kid ? (
              <b>{s.kidTitle}</b>
            ) : (
              <>
                <b>{s.message}</b>
                <span>{s.summary}</span>
              </>
            )}
          </>
        ) : (
          <span>{kid ? '「すすむ」で スタート' : '「進む」で開始'}</span>
        )}
      </div>
      <SequenceDiagram protocol={protocol} mode={mode} current={cur} travelMs={travelMs} onSelect={onSelect} />
    </section>
  );
}

/** 2 つのプロトコルを並べて同じ手数ずつ進める */
export function CompareView(props: Props) {
  const { preset, mode } = props;
  const kid = mode === 'kid';
  const [a, b] = presetProtocols(preset);
  const ma = metrics(a);
  const mb = metrics(b);
  return (
    <main className="compare">
      <div className="compare-cols">
        <Side protocol={a} {...props} />
        <Side protocol={b} {...props} />
      </div>
      <section className="panel compare-notes">
        <h2>{kid ? preset.kidName : preset.name}</h2>
        <p className="compare-tag">{kid ? preset.kidTagline : preset.tagline}</p>
        {preset.viz && <VizView viz={preset.viz} kid={kid} />}
        <div className="compare-table-wrap">
          <table className="fields compare-table">
            <thead>
              <tr>
                <th scope="col" />
                <th scope="col">{a.name}</th>
                <th scope="col">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {/* 行の値は大人向けの言葉なので、こども向けでは出さない */}
              {(kid ? [] : (preset.rows ?? [])).map((r) => (
                <tr key={r.label}>
                  <th scope="row">{kid ? r.kidLabel : r.label}</th>
                  <td>{r.left}</td>
                  <td>{r.right}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">{kid ? 'おくる パケットの かず' : 'メッセージ数'}</th>
                <td>{ma.messages}</td>
                <td>{mb.messages}</td>
              </tr>
              <tr>
                <th scope="row">{kid ? 'そのうち かぎつき' : 'うち暗号化'}</th>
                <td>{ma.encrypted}</td>
                <td>{mb.encrypted}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="compare-points">
          {preset.points.map((p) => (
            <li key={p.adult}>{kid ? p.kid : p.adult}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
