import type { Protocol } from '../protocols/types';
import { PacketBuddy } from './PacketBuddy';
import { rfcLabel, rfcUrl } from '../lib/rfc';
import { UI, type Mode } from '../lib/text';

interface Props {
  protocol: Protocol;
  current: number;
  mode: Mode;
}

export function StepDetail({ protocol, current, mode }: Props) {
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
          {kid ? from.kidName : from.name} → {kid ? to.kidName : to.name}
        </span>
        {phase && (
          <span className="chip" style={{ background: phase.color }}>
            {kid ? phase.kidName : phase.name}
          </span>
        )}
        {step.encrypted && <span className="chip chip-lock">🔒 {ui.encrypted}</span>}
        {step.optional && <span className="chip chip-opt">※ {ui.optional}</span>}
      </div>

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

      {step.rfc && step.rfc.length > 0 && (
        <p className="rfc-links">
          <span>{ui.refs}</span>
          {step.rfc.map((r) => (
            <a key={rfcLabel(r)} href={rfcUrl(r)} target="_blank" rel="noreferrer">
              {rfcLabel(r)}
            </a>
          ))}
        </p>
      )}
    </article>
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
        <dt>RFC</dt>
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
    </article>
  );
}
