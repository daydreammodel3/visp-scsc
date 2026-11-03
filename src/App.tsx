import { useCallback, useEffect, useState } from 'react';
import { protocols, categories, findProtocol } from './protocols';
import { SequenceDiagram } from './components/SequenceDiagram';
import { StepControls, SPEEDS, type Speed } from './components/StepControls';
import { StepDetail } from './components/StepDetail';
import { PacketBuddy } from './components/PacketBuddy';
import { SideNav } from './components/SideNav';
import { useMediaQuery } from './lib/useMediaQuery';
import { compareLength, parseHash, toHash } from './lib/route';
import { CompareView } from './components/CompareView';
import { comparePresets, findPreset } from './protocols/compare';
import { UI, loadMode, saveMode, type Mode } from './lib/text';

function loadNavPref(): boolean {
  try {
    return localStorage.getItem('nav') !== 'closed';
  } catch {
    return true;
  }
}

function saveNavPref(open: boolean): void {
  try {
    localStorage.setItem('nav', open ? 'open' : 'closed');
  } catch {
    /* 保存できなくても動作には影響しない */
  }
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [mode, setMode] = useState<Mode>(loadMode);
  const narrow = useMediaQuery('(max-width: 900px)');
  // PC では開いた状態、スマホでは閉じた状態から始める（PC での開閉は記憶する）
  const [navPref, setNavPref] = useState<boolean>(() => loadNavPref());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navOpen = narrow ? drawerOpen : navPref;
  const toggleNav = () => {
    if (narrow) setDrawerOpen((o) => !o);
    else
      setNavPref((o) => {
        saveNavPref(!o);
        return !o;
      });
  };

  const protocol = findProtocol(route.protocolId) ?? protocols[0];
  const preset = findPreset(route.compareId);
  const total = preset ? compareLength(preset.id) : protocol.steps.length;
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

  const goTo = useCallback((n: number) => setRoute((r) => ({ ...r, step: Math.min(Math.max(n, 0), total) })), [total]);

  const selectProtocol = (id: string) => {
    setPlaying(false);
    setRoute({ protocolId: id, step: 0 });
    if (narrow) setDrawerOpen(false);
  };

  const selectCompare = (id: string) => {
    const p = findPreset(id);
    if (!p) return;
    setPlaying(false);
    setRoute({ protocolId: p.left, compareId: id, step: 0 });
    if (narrow) setDrawerOpen(false);
  };

  /** 別のプロトコルの特定のステップへ移動（「詳しく見る」など） */
  const navigate = (id: string, step: number) => {
    setPlaying(false);
    setRoute({ protocolId: id, step });
    window.scrollTo({ top: 0 });
  };

  // スマホのメニューは Esc で閉じる
  useEffect(() => {
    if (!(narrow && drawerOpen)) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [narrow, drawerOpen]);

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
      if (narrow && drawerOpen) return;
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
  }, [current, total, goTo, togglePlay, narrow, drawerOpen]);

  return (
    <div className="app">
      <header className="top">
        <button
          type="button"
          className={navOpen ? 'hamburger open' : 'hamburger'}
          aria-expanded={navOpen}
          aria-controls="sidenav"
          aria-label={navOpen ? ui.closeMenu : ui.openMenu}
          title={navOpen ? ui.closeMenu : ui.openMenu}
          onClick={toggleNav}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="brand">
          <PacketBuddy size={52} color="#ff9f43" accessory="wave" />
          <div>
            <h1>ハンドシェイクずかん</h1>
            <p>{ui.subtitle}</p>
          </div>
        </div>
        <div className="mode" role="radiogroup" aria-label={ui.modeGroup}>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'adult'}
            className={mode === 'adult' ? 'on' : ''}
            onClick={() => setMode('adult')}
          >
            大人向け
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'kid'}
            className={mode === 'kid' ? 'on' : ''}
            onClick={() => setMode('kid')}
          >
            こども向け
          </button>
        </div>
      </header>

      <div className={navOpen ? 'shell nav-open' : 'shell'}>
        {navOpen && (
          <SideNav
            id="sidenav"
            categories={categories}
            currentId={protocol.id}
            compares={comparePresets}
            currentCompareId={preset?.id}
            onSelectCompare={selectCompare}
            mode={mode}
            label={ui.pickProtocol}
            onSelect={selectProtocol}
            onClose={narrow ? () => setDrawerOpen(false) : undefined}
            closeLabel={ui.closeMenu}
          />
        )}
        {narrow && drawerOpen && <div className="backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}
        <div className="content">
          {preset ? (
            <CompareView
              preset={preset}
              step={current}
              mode={mode}
              travelMs={SPEEDS[speed].travel}
              onSelect={(i) => {
                setPlaying(false);
                goTo(i);
              }}
              onOpen={navigate}
            />
          ) : (
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
                <StepDetail protocol={protocol} current={current} mode={mode} onNavigate={navigate} />
              </section>
            </main>
          )}

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
          <p className="credit">
            <abbr title="VISualize communication Protocols as Small, Cute, Stylized Characters.">VISP-SCSC</abbr> — <b>VIS</b>ualize
            communication <b>P</b>rotocols as <b>S</b>mall, <b>C</b>ute, <b>S</b>tylized <b>C</b>haracters.
          </p>
        </div>
      </div>
    </div>
  );
}
