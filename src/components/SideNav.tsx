import type { Category } from '../protocols/types';
import type { ComparePreset } from '../protocols/compare';
import { LEVEL_LABEL, type Mode } from '../lib/text';
import { findProtocol } from '../protocols';

interface Props {
  id: string;
  categories: Category[];
  currentId: string;
  compares: ComparePreset[];
  currentCompareId?: string;
  onSelectCompare: (id: string) => void;
  mode: Mode;
  label: string;
  onSelect: (id: string) => void;
  /** スマホのドロワー表示のときだけ渡す（閉じるボタンを出す） */
  onClose?: () => void;
  closeLabel?: string;
}

/** 比較の難しさは、左右のうち難しいほう */
function presetLevel(c: ComparePreset): 1 | 2 | 3 {
  return Math.max(findProtocol(c.left)?.level ?? 1, findProtocol(c.right)?.level ?? 1) as 1 | 2 | 3;
}

function LevelTag({ level, kid }: { level: 1 | 2 | 3; kid: boolean }) {
  // 大人向けでは入門は表示しない（多すぎると目立たないため）
  if (!kid && level === 1) return null;
  return <span className={`nav-level level-${level}`}>{kid ? LEVEL_LABEL[level][1] : LEVEL_LABEL[level][0]}</span>;
}

/** 左側のプロトコルメニュー */
export function SideNav({
  id,
  categories,
  currentId,
  compares,
  currentCompareId,
  onSelectCompare,
  mode,
  label,
  onSelect,
  onClose,
  closeLabel,
}: Props) {
  const kid = mode === 'kid';
  return (
    <nav id={id} className="sidenav" aria-label={label}>
      {onClose && (
        <button type="button" className="nav-close" onClick={onClose} aria-label={closeLabel} autoFocus>
          ×
        </button>
      )}
      {categories.map((c) => (
        <div key={c.id} className="nav-group">
          <h2 className="nav-heading">{kid ? c.kidName : c.name}</h2>
          <ul>
            {c.protocols.map((p) => {
              const on = !currentCompareId && p.id === currentId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={on ? 'nav-item on' : 'nav-item'}
                    aria-current={on ? 'page' : undefined}
                    onClick={() => onSelect(p.id)}
                  >
                    <span className="nav-name">{p.name}</span>
                    <span className="nav-tag">{kid ? p.kidTagline : p.tagline}</span>
                    <LevelTag level={p.level} kid={kid} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="nav-group">
        <h2 className="nav-heading">{kid ? 'くらべて みよう' : '比較'}</h2>
        <ul>
          {compares.map((c) => {
            const on = c.id === currentCompareId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={on ? 'nav-item on' : 'nav-item'}
                  aria-current={on ? 'page' : undefined}
                  onClick={() => onSelectCompare(c.id)}
                >
                  <span className="nav-name">{kid ? c.kidName : c.name}</span>
                  <span className="nav-tag">{kid ? c.kidTagline : c.tagline}</span>
                  <LevelTag level={presetLevel(c)} kid={kid} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
