import type { Category } from '../protocols/types';
import type { Mode } from '../lib/text';

interface Props {
  id: string;
  categories: Category[];
  currentId: string;
  mode: Mode;
  label: string;
  onSelect: (id: string) => void;
  /** スマホのドロワー表示のときだけ渡す（閉じるボタンを出す） */
  onClose?: () => void;
  closeLabel?: string;
}

/** 左側のプロトコルメニュー */
export function SideNav({ id, categories, currentId, mode, label, onSelect, onClose, closeLabel }: Props) {
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
              const on = p.id === currentId;
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
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
