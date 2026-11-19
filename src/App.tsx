import { useCallback, useEffect, useState } from 'react';
import { protocols, categories, findProtocol } from './protocols';
import { comparePresets, findPreset } from './protocols/compare';
import { AppHeader } from './components/AppHeader';
import { CompareView } from './components/CompareView';
import { SequenceDiagram } from './components/SequenceDiagram';
import { SeriesLinks } from './components/SeriesLinks';
import { SideNav } from './components/SideNav';
import { StepControls, SPEEDS, type Speed } from './components/StepControls';
import { StepDetail } from './components/StepDetail';
import { useHashRoute } from './hooks/useHashRoute';
import { useNavDrawer } from './hooks/useNavDrawer';
import { usePlayback } from './hooks/usePlayback';
import { compareLength } from './lib/route';
import { UI, loadMode, saveMode, type Mode } from './lib/text';

export default function App() {
  const [route, setRoute] = useHashRoute();
  const [speed, setSpeed] = useState<Speed>('normal');
  const [mode, setMode] = useState<Mode>(loadMode);
  const nav = useNavDrawer();

  const protocol = findProtocol(route.protocolId) ?? protocols[0];
  const preset = findPreset(route.compareId);
  const total = preset ? compareLength(preset.id) : protocol.steps.length;
  const current = route.step;

  useEffect(() => saveMode(mode), [mode]);
  const ui = UI[mode];

  const goTo = useCallback((n: number) => setRoute((r) => ({ ...r, step: Math.min(Math.max(n, 0), total) })), [setRoute, total]);
  const playback = usePlayback({ current, total, goTo, interval: SPEEDS[speed].interval, keysEnabled: !nav.drawerShown });
  const travelMs = SPEEDS[speed].travel;

  const selectProtocol = (id: string) => {
    playback.stop();
    setRoute({ protocolId: id, step: 0 });
    nav.closeIfNarrow();
  };

  const selectCompare = (id: string) => {
    const p = findPreset(id);
    if (!p) return;
    playback.stop();
    setRoute({ protocolId: p.left, compareId: id, step: 0 });
    nav.closeIfNarrow();
  };

  /** 別のプロトコルの特定のステップへ移動（「詳しく見る」など） */
  const navigate = (id: string, step: number) => {
    playback.stop();
    setRoute({ protocolId: id, step });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app">
      <AppHeader mode={mode} onMode={setMode} navOpen={nav.navOpen} onToggleNav={nav.toggleNav} />

      <div className={nav.navOpen ? 'shell nav-open' : 'shell'}>
        {nav.navOpen && (
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
            onClose={nav.narrow ? nav.closeDrawer : undefined}
            closeLabel={ui.closeMenu}
          />
        )}
        {nav.drawerShown && <div className="backdrop" onClick={nav.closeDrawer} aria-hidden="true" />}
        <div className="content">
          {preset ? (
            <CompareView preset={preset} step={current} mode={mode} travelMs={travelMs} onSelect={playback.jump} onOpen={navigate} />
          ) : (
            <main className="stage">
              <section className="panel panel-diagram" aria-label={ui.diagram}>
                <SequenceDiagram protocol={protocol} mode={mode} current={current} travelMs={travelMs} onSelect={playback.jump} />
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
              playing={playback.playing}
              speed={speed}
              mode={mode}
              onChange={playback.jump}
              onTogglePlay={playback.togglePlay}
              onSpeed={setSpeed}
            />
          </footer>
          <p className="credit">
            <abbr title="VISualize communication Protocols as Small, Cute, Stylized Characters.">VISP-SCSC</abbr> — <b>VIS</b>ualize
            communication <b>P</b>rotocols as <b>S</b>mall, <b>C</b>ute, <b>S</b>tylized <b>C</b>haracters.
          </p>
          <SeriesLinks current="visp" />
        </div>
      </div>
    </div>
  );
}
