import type { Protocol } from '../protocols/types';
import { PacketBuddy } from './PacketBuddy';
import { rfcLabel, rfcUrl } from '../lib/rfc';
import { UI, type Mode } from '../lib/text';
import { KeyInventory } from './KeyInventory';
import { VizView } from './VizView';
import { InsightPanel } from './InsightPanel';
import { statesAt } from '../lib/nodeStates';
import { findProtocol } from '../protocols';

interface Props {
  protocol: Protocol;
  current: number;
  mode: Mode;
  onNavigate?: (protocolId: string, step: number) => void;
}

function NodeStates({ protocol, current, kid }: { protocol: Protocol; current: number; kid: boolean }) {
  const st = statesAt(protocol, current);
  if (!st) return null;
  return (
    <div className="node-states" aria-label={kid ? 'いまの じょうたい' : '各ノードの状態'}>
      {protocol.actors
        .filter((a) => st[a.id].state !== '—')
        .map((a) => (
          <span key={a.id} className={st[a.id].changed ? 'node-state changed' : 'node-state'}>
            <small>{kid ? a.kidName : a.name.replace(/（.*）/, '')}</small>
            <b>{st[a.id].state}</b>
          </span>
        ))}
    </div>
  );
}

export function StepDetail({ protocol, current, mode, onNavigate }: Props) {
  if (current === 0) return <Intro protocol={protocol} mode={mode} />;
  const ui = UI[mode];
  const kid = mode === 'kid';
  const step = protocol.steps[current - 1];
  const from = protocol.actors.find((a) => a.id === step.from)!;
  const to = protocol.actors.find((a) => a.id === step.to)!;
  const phase = protocol.phases.find((p) => p.id === step.phase);
  const flip = protocol.actors.indexOf(to) < protocol.actors.indexOf(from);

  return (
    <article className="detail" key={`${protocol.id}-${current}`}>
      <div className="detail-hero">
        <PacketBuddy
          size={118}
          color={step.look.color}
          accessory={step.look.accessory}
          encrypted={step.encrypted}
          flip={flip}
          className="buddy-idle"
          title={`${step.message} のキャラクター`}
        />
        {kid ? (
          <div className="bubble">
            <p className="bubble-name">
              ぼくは <b>{step.message}</b>
            </p>
            <p className="bubble-title">{step.kidTitle}</p>
          </div>
        ) : (
          <div className="bubble bubble-adult">
            <p className="bubble-step">STEP {current}</p>
            <h2 className="bubble-message">{step.message}</h2>
            <p className="bubble-summary">{step.summary}</p>
          </div>
        )}
      </div>

      <div className="chips">
        <span className="chip">
          {step.from === step.to
            ? `${kid ? from.kidName : from.name}${kid ? ' の なかで' : ' の内部処理'}`
            : `${kid ? from.kidName : from.name} → ${kid ? to.kidName : to.name}`}
        </span>
        {phase && (
          <span className="chip" style={{ background: phase.color }}>
            {kid ? phase.kidName : phase.name}
          </span>
        )}
        {step.encrypted && <span className="chip chip-lock">🔒 {ui.encrypted}</span>}
        {step.optional && <span className="chip chip-opt">※ {ui.optional}</span>}
        {step.danger && <span className="chip chip-danger">⚠ {ui.danger}</span>}
        {step.lost && <span className="chip chip-danger">✕ {ui.lost}</span>}
      </div>

      <NodeStates protocol={protocol} current={current} kid={kid} />
      {step.viz && <VizView viz={step.viz} kid={kid} />}

      {kid ? (
        <p className="kid-text">{step.kid}</p>
      ) : (
        <>
          <p className="pro-text">{step.detail}</p>
          {step.fields && step.fields.length > 0 && (
            <table className="fields">
              <caption>{ui.fields}</caption>
              <tbody>
                {step.fields.map((f) => (
                  <tr key={f.name}>
                    <th scope="row">{f.name}</th>
                    <td>
                      <code>{f.value}</code>
                      {f.note && <small> — {f.note}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {((step.rfc?.length ?? 0) > 0 || (step.refs?.length ?? 0) > 0) && (
        <p className="rfc-links">
          <span>{ui.refs}</span>
          {step.rfc?.map((r) => (
            <a key={rfcLabel(r)} href={rfcUrl(r)} target="_blank" rel="noreferrer">
              {rfcLabel(r)}
            </a>
          ))}
          {step.refs?.map((r) => (
            <a key={r.url + r.label} href={r.url} target="_blank" rel="noreferrer">
              {r.label}
            </a>
          ))}
        </p>
      )}
      {step.see && onNavigate && <SeeLink see={step.see} kid={kid} onNavigate={onNavigate} />}
      <KeyInventory protocol={protocol} current={current} mode={mode} />
      {current === protocol.steps.length && <InsightPanel groups={protocol.insights} mode={mode} />}
    </article>
  );
}

function SeeLink({
  see,
  kid,
  onNavigate,
}: {
  see: { protocol: string; step?: number };
  kid: boolean;
  onNavigate: (p: string, s: number) => void;
}) {
  const target = findProtocol(see.protocol);
  if (!target) return null;
  return (
    <button type="button" className="see-link" onClick={() => onNavigate(target.id, see.step ?? 0)}>
      {kid ? `「${target.name}」を くわしく みる →` : `「${target.name}」で詳しく見る →`}
    </button>
  );
}

function Intro({ protocol, mode }: { protocol: Protocol; mode: Mode }) {
  const first = protocol.steps[0];
  const ui = UI[mode];
  const kid = mode === 'kid';
  return (
    <article className="detail" key={`${protocol.id}-intro`}>
      <div className="detail-hero">
        <PacketBuddy size={118} color={first.look.color} accessory="wave" className="buddy-idle" />
        <div className="bubble">
          <p className="bubble-title">{ui.introLead(protocol.name)}</p>
          <p className="bubble-name">{ui.introStart}</p>
        </div>
      </div>
      <p className={kid ? 'kid-text' : 'pro-text'}>{kid ? protocol.kidIntro : protocol.intro}</p>
      {protocol.introViz && <VizView viz={protocol.introViz} kid={kid} />}

      <dl className="intro-meta">
        <dt>{ui.nodes}</dt>
        <dd>
          {protocol.actors.map((a) => (
            <span key={a.id} className="chip">
              {kid ? `${a.kidName}（${a.name}）` : a.name}
            </span>
          ))}
        </dd>
        <dt>{ui.layer}</dt>
        <dd>{protocol.layer}</dd>
        <dt>{protocol.standards?.length ? (kid ? 'もとに なった きまり' : 'RFC・規格') : 'RFC'}</dt>
        <dd>
          <ul className="rfc-list">
            {protocol.rfcs.map((r) => (
              <li key={r.rfc}>
                <a href={rfcUrl({ rfc: r.rfc })} target="_blank" rel="noreferrer">
                  RFC {r.rfc}
                </a>{' '}
                <small>{r.title}</small>
              </li>
            ))}
            {protocol.standards?.map((d) => (
              <li key={d.url}>
                <a href={d.url} target="_blank" rel="noreferrer">
                  {d.label}
                </a>{' '}
                <small>{d.title}</small>
              </li>
            ))}
          </ul>
        </dd>
      </dl>

      <div className="legend">
        <div>
          <PacketBuddy size={54} color="#a55eea" accessory="box" encrypted />
          <span>{ui.legendLock}</span>
        </div>
        <div>
          <span className="legend-dash" aria-hidden="true" />
          <span>{ui.legendDash}</span>
        </div>
      </div>
      <NodeStates protocol={protocol} current={0} kid={kid} />
      <KeyInventory protocol={protocol} current={0} mode={mode} />
      <InsightPanel groups={protocol.insights} mode={mode} />
    </article>
  );
}
