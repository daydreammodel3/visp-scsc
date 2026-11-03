import { useCallback, useEffect, useState } from 'react';
import { protocols, findProtocol } from './protocols';
import { SequenceDiagram } from './components/SequenceDiagram';
import { StepControls, SPEEDS, type Speed } from './components/StepControls';
import { StepDetail } from './components/StepDetail';
import { PacketBuddy } from './components/PacketBuddy';
import { parseHash, toHash } from './lib/route';
import { UI, loadMode, saveMode, type Mode } from './lib/text';

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [mode, setMode] = useState<Mode>(loadMode);

  const protocol = findProtocol(route.protocolId) ?? protocols[0];
  const total = protocol.steps.length;
  const current = route.step;

  // URL のハッシュと同期（共有・ブラウザの戻る に対応）
  useEffect(() => {
    const next = toHash(route);
    if (window.location.hash !== next) window.history.replaceState(null, '', next);
  }, [route]);
  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => saveMode(mode), [mode]);
  const ui = UI[mode];

  const goTo = useCallback(
    (n: number) => setRoute((r) => ({ ...r, step: Math.min(Math.max(n, 0), total) })),
    [total],
  );

  const selectProtocol = (id: string) => {
    setPlaying(false);
    setRoute({ protocolId: id, step: 0 });
  };

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (current >= total) goTo(0);
    setPlaying(true);
  }, [playing, current, total, goTo]);

  // じどう再生
  useEffect(() => {
    if (!playing) return;
    if (current >= total) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => goTo(current + 1), current === 0 ? 300 : SPEEDS[speed].interval);
    return () => window.clearTimeout(id);
  }, [playing, current, total, speed, goTo]);

  // キーボード操作
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') {
        setPlaying(false);
        goTo(current + 1);
      } else if (e.key === 'ArrowLeft') {
        setPlaying(false);
        goTo(current - 1);
      } else if (e.key === 'Home') {
        setPlaying(false);
        goTo(0);
      } else if (e.key === 'End') {
        setPlaying(false);
        goTo(total);
      } else if (e.key === ' ' && target?.tagName !== 'BUTTON' && target?.getAttribute('role') !== 'button') {
        e.preventDefault();
        togglePlay();
      } else return;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, total, goTo, togglePlay]);

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <PacketBuddy size={52} color="#ff9f43" accessory="wave" />
          <div>
            <h1>ハンドシェイクずかん</h1>
            <p>{ui.subtitle}</p>
          </div>
        </div>
        <div className="mode" role="radiogroup" aria-label={ui.modeGroup}>
          <button type="button" role="radio" aria-checked={mode === 'adult'} className={mode === 'adult' ? 'on' : ''} onClick={() => setMode('adult')}>
            大人向け
          </button>
          <button type="button" role="radio" aria-checked={mode === 'kid'} className={mode === 'kid' ? 'on' : ''} onClick={() => setMode('kid')}>
            こども向け
          </button>
        </div>
      </header>

      <nav className="protocols" aria-label={ui.pickProtocol}>
        {protocols.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === protocol.id ? 'proto on' : 'proto'}
            aria-pressed={p.id === protocol.id}
            onClick={() => selectProtocol(p.id)}
          >
            <span className="proto-name">{p.name}</span>
            <span className="proto-tag">{mode === 'kid' ? p.kidTagline : p.tagline}</span>
          </button>
        ))}
      </nav>

      <main className="stage">
        <section className="panel panel-diagram" aria-label={ui.diagram}>
          <SequenceDiagram
            protocol={protocol}
            mode={mode}
            current={current}
            travelMs={SPEEDS[speed].travel}
            onSelect={(i) => {
              setPlaying(false);
              goTo(i);
            }}
          />
        </section>
        <section className="panel panel-detail" aria-live="polite">
          <StepDetail protocol={protocol} current={current} mode={mode} />
        </section>
      </main>

      <p className="credit">
        <abbr title="VISualize communication Protocols as Small, Cute, Stylized Characters.">VISP-SCSC</abbr> —{' '}
        <b>VIS</b>ualize communication <b>P</b>rotocols as <b>S</b>mall, <b>C</b>ute, <b>S</b>tylized <b>C</b>haracters.
      </p>

      <footer className="dock">
        <StepControls
          current={current}
          total={total}
          playing={playing}
          speed={speed}
          mode={mode}
          onChange={(n) => {
            setPlaying(false);
            goTo(n);
          }}
          onTogglePlay={togglePlay}
          onSpeed={setSpeed}
        />
      </footer>
    </div>
  );
}
