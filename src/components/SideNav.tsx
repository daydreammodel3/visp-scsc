import { useEffect, useMemo, useState } from 'react';
import type { Category, Protocol } from '../protocols/types';
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

type Level = 1 | 2 | 3;

/** 比較の難しさは、左右のうち難しいほう */
function presetLevel(c: ComparePreset): Level {
  return Math.max(findProtocol(c.left)?.level ?? 1, findProtocol(c.right)?.level ?? 1) as Level;
}

function LevelTag({ level, kid }: { level: Level; kid: boolean }) {
  // 大人向けでは入門は表示しない（多すぎると目立たないため）
  if (!kid && level === 1) return null;
  return <span className={`nav-level level-${level}`}>{kid ? LEVEL_LABEL[level][1] : LEVEL_LABEL[level][0]}</span>;
}

/** 検索用に、大文字小文字・全角半角の違いをならす */
const norm = (s: string) => s.normalize('NFKC').toLowerCase();

/** レッスンの検索対象: 名前・説明・ID・カテゴリ名・メッセージ名 */
function protocolText(p: Protocol, c: Category): string {
  return norm([p.id, p.name, p.tagline, p.kidTagline, c.name, c.kidName, ...p.steps.map((s) => s.message)].join(' '));
}

function compareText(cp: ComparePreset, c: Category): string {
  return norm([cp.id, cp.name, cp.kidName, cp.tagline, cp.kidTagline, c.name, c.kidName, '比較 くらべて', cp.left, cp.right].join(' '));
}

const STORE_KEY = 'nav-open-groups';
const EASY_KEY = 'nav-easy-only';

function loadSet(): Set<string> | null {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v ? new Set(JSON.parse(v) as string[]) : null;
  } catch {
    return null;
  }
}

function saveSet(s: Set<string>) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...s]));
  } catch {
    /* 保存できなくても動作には影響しない */
  }
}

/** 左側のプロトコルメニュー。カテゴリは折りたためて、検索と「入門だけ」で絞り込める */
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

  // いま開いているレッスン（または比較）が入っているカテゴリ
  const currentCat = useMemo(() => {
    if (currentCompareId) return compares.find((c) => c.id === currentCompareId)?.category;
    return categories.find((c) => c.protocols.some((p) => p.id === currentId))?.id;
  }, [categories, compares, currentId, currentCompareId]);

  const [open, setOpen] = useState<Set<string>>(() => loadSet() ?? new Set(currentCat ? [currentCat] : []));
  const [query, setQuery] = useState('');
  const [easyOnly, setEasyOnly] = useState(() => {
    try {
      return localStorage.getItem(EASY_KEY) === '1';
    } catch {
      return false;
    }
  });

  // 別のカテゴリのレッスンに移ったら、そのカテゴリを開く
  useEffect(() => {
    if (!currentCat) return;
    setOpen((prev) => {
      if (prev.has(currentCat)) return prev;
      const next = new Set(prev).add(currentCat);
      saveSet(next);
      return next;
    });
  }, [currentCat]);

  const toggle = (cid: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid);
      else next.add(cid);
      saveSet(next);
      return next;
    });

  const toggleEasy = () =>
    setEasyOnly((v) => {
      try {
        localStorage.setItem(EASY_KEY, v ? '0' : '1');
      } catch {
        /* 無視 */
      }
      return !v;
    });

  const q = norm(query.trim());
  const filtering = q !== '' || easyOnly;

  const groups = categories.map((c) => {
    const lessons = c.protocols.filter((p) => (!easyOnly || p.level === 1) && (!q || protocolText(p, c).includes(q)));
    const cmps = compares
      .filter((cp) => cp.category === c.id)
      .filter((cp) => (!easyOnly || presetLevel(cp) === 1) && (!q || compareText(cp, c).includes(q)));
    return { c, lessons, cmps, total: c.protocols.length + compares.filter((cp) => cp.category === c.id).length };
  });
  const shown = filtering ? groups.filter((g) => g.lessons.length + g.cmps.length > 0) : groups;

  const allOpen = shown.every((g) => open.has(g.c.id));
  const setAll = (value: boolean) => {
    const next = value ? new Set(categories.map((c) => c.id)) : new Set<string>(currentCat ? [currentCat] : []);
    saveSet(next);
    setOpen(next);
  };

  return (
    <nav id={id} className="sidenav" aria-label={label}>
      {onClose && (
        <button type="button" className="nav-close" onClick={onClose} aria-label={closeLabel} autoFocus>
          ×
        </button>
      )}

      <div className="nav-tools">
        <input
          type="search"
          className="nav-search"
          value={query}
          placeholder={kid ? 'さがす（れい: かぎ）' : '検索（例: QUIC）'}
          aria-label={kid ? 'レッスンを さがす' : 'レッスンを検索'}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && query) {
              e.stopPropagation();
              setQuery('');
            }
          }}
        />
        <div className="nav-tool-row">
          <button type="button" className={easyOnly ? 'nav-chip on' : 'nav-chip'} aria-pressed={easyOnly} onClick={toggleEasy}>
            {kid ? '★ やさしいのだけ' : '入門だけ'}
          </button>
          {!filtering && (
            <button type="button" className="nav-chip" onClick={() => setAll(!allOpen)}>
              {allOpen ? (kid ? 'ぜんぶ とじる' : 'すべて閉じる') : kid ? 'ぜんぶ ひらく' : 'すべて開く'}
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 && <p className="nav-empty">{kid ? 'みつからなかったよ' : '見つかりませんでした'}</p>}

      {shown.map(({ c, lessons, cmps, total }) => {
        // 絞り込み中は、当てはまるものがあるカテゴリをすべて開いて見せる
        const expanded = filtering || open.has(c.id);
        const count = filtering ? lessons.length + cmps.length : total;
        return (
          <div key={c.id} className="nav-group">
            <h2 className="nav-heading">
              <button
                type="button"
                className="nav-group-toggle"
                aria-expanded={expanded}
                aria-controls={`nav-${c.id}`}
                onClick={() => !filtering && toggle(c.id)}
                disabled={filtering}
              >
                <span className="nav-caret" aria-hidden="true">
                  {expanded ? '▾' : '▸'}
                </span>
                <span className="nav-heading-text">{kid ? c.kidName : c.name}</span>
                <span className="nav-count">{count}</span>
              </button>
            </h2>
            {expanded && (
              <ul id={`nav-${c.id}`}>
                {lessons.map((p) => {
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
                {cmps.map((cp) => {
                  const on = cp.id === currentCompareId;
                  return (
                    <li key={cp.id}>
                      <button
                        type="button"
                        className={on ? 'nav-item nav-compare on' : 'nav-item nav-compare'}
                        aria-current={on ? 'page' : undefined}
                        onClick={() => onSelectCompare(cp.id)}
                      >
                        <span className="nav-name">
                          <span className="nav-compare-mark">{kid ? 'くらべる' : '比較'}</span>
                          {kid ? cp.kidName : cp.name}
                        </span>
                        <span className="nav-tag">{kid ? cp.kidTagline : cp.tagline}</span>
                        <LevelTag level={presetLevel(cp)} kid={kid} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
