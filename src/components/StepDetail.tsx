import type { Protocol } from '../protocols/types';
import { PacketBuddy } from './PacketBuddy';
import { rfcLabel, rfcUrl } from '../lib/rfc';

export type Mode = 'kid' | 'pro';

interface Props {
  protocol: Protocol;
  current: number;
  mode: Mode;
}

export function StepDetail({ protocol, current, mode }: Props) {
  if (current === 0) return <Intro protocol={protocol} mode={mode} />;
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
        <div className="bubble">
          <p className="bubble-name">
            ぼくは <b>{step.message}</b>
          </p>
          <p className="bubble-title">{step.kidTitle}</p>
        </div>
      </div>

      <div className="chips">
        <span className="chip">
          {mode === 'kid' ? from.kidName : from.name} → {mode === 'kid' ? to.kidName : to.name}
        </span>
        {phase && (
          <span className="chip" style={{ background: phase.color }}>
            {mode === 'kid' ? phase.kidName : phase.name}
          </span>
        )}
        {step.encrypted && <span className="chip chip-lock">🔒 {mode === 'kid' ? 'かぎつき' : '暗号化'}</span>}
        {step.optional && <span className="chip chip-opt">※ {mode === 'kid' ? 'ないときも あるよ' : '省略されることがある'}</span>}
      </div>

      {mode === 'kid' ? (
        <p className="kid-text">{step.kid}</p>
      ) : (
        <>
          <p className="pro-text">{step.detail}</p>
          {step.fields && step.fields.length > 0 && (
            <table className="fields">
              <caption>おもな フィールド</caption>
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
          <span>{mode === 'kid' ? 'もとになった きまり：' : '参照：'}</span>
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
  return (
    <article className="detail" key={`${protocol.id}-intro`}>
      <div className="detail-hero">
        <PacketBuddy size={118} color={first.look.color} accessory="wave" className="buddy-idle" />
        <div className="bubble">
          <p className="bubble-name">
            <b>{protocol.name}</b> の せかいへ ようこそ！
          </p>
          <p className="bubble-title">「すすむ」を おして スタート！</p>
        </div>
      </div>
      <p className={mode === 'kid' ? 'kid-text' : 'pro-text'}>{mode === 'kid' ? protocol.kidIntro : protocol.intro}</p>

      <dl className="intro-meta">
        <dt>{mode === 'kid' ? 'とうじょうじんぶつ' : '登場するノード'}</dt>
        <dd>
          {protocol.actors.map((a) => (
            <span key={a.id} className="chip">
              {a.kidName}（{a.name}）
            </span>
          ))}
        </dd>
        <dt>{mode === 'kid' ? 'どこで はたらく？' : 'レイヤー'}</dt>
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
          <span>{mode === 'kid' ? 'シールドと かぎ ＝ かぎつき（ほかの人には よめない）' : 'シールド＋南京錠 ＝ 暗号化されたメッセージ'}</span>
        </div>
        <div>
          <span className="legend-dash" aria-hidden="true" />
          <span>{mode === 'kid' ? 'てんせん と ※ ＝ ないときも ある' : '破線・※ ＝ 省略可能なメッセージ'}</span>
        </div>
      </div>
    </article>
  );
}
