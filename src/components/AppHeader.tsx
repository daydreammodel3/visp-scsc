import { UI, type Mode } from '../lib/text';
import { PacketBuddy } from './PacketBuddy';

interface Props {
  mode: Mode;
  onMode: (mode: Mode) => void;
  navOpen: boolean;
  onToggleNav: () => void;
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'adult', label: '大人向け' },
  { id: 'kid', label: 'こども向け' },
];

/** 画面上部: メニューの開閉ボタン・サイト名・大人向け／こども向けの切り替え */
export function AppHeader({ mode, onMode, navOpen, onToggleNav }: Props) {
  const ui = UI[mode];
  const navLabel = navOpen ? ui.closeMenu : ui.openMenu;
  return (
    <header className="top">
      <button
        type="button"
        className={navOpen ? 'hamburger open' : 'hamburger'}
        aria-expanded={navOpen}
        aria-controls="sidenav"
        aria-label={navLabel}
        title={navLabel}
        onClick={onToggleNav}
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
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            className={mode === m.id ? 'on' : ''}
            onClick={() => onMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
}
