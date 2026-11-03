interface Props {
  current: number;
  total: number;
  playing: boolean;
  speed: Speed;
  onChange: (index: number) => void;
  onTogglePlay: () => void;
  onSpeed: (s: Speed) => void;
}

export type Speed = 'slow' | 'normal' | 'fast';
export const SPEEDS: Record<Speed, { label: string; travel: number; interval: number }> = {
  slow: { label: 'ゆっくり', travel: 1800, interval: 4200 },
  normal: { label: 'ふつう', travel: 1200, interval: 2800 },
  fast: { label: 'はやい', travel: 650, interval: 1500 },
};

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

const ICONS = {
  first: 'M6 5h2.5v14H6zM20 5v14L9.5 12z',
  prev: 'M18 5v14L7 12z',
  next: 'M6 5v14l11-7z',
  last: 'M4 5v14l10.5-7zM15.5 5H18v14h-2.5z',
  play: 'M7 4.5v15l12.5-7.5z',
  pause: 'M6.5 5h4v14h-4zM13.5 5h4v14h-4z',
};

export function StepControls({ current, total, playing, speed, onChange, onTogglePlay, onSpeed }: Props) {
  const atStart = current <= 0;
  const atEnd = current >= total;
  return (
    <div className="controls" role="toolbar" aria-label="ステップそうさ">
      <div className="control-buttons">
        <button type="button" className="ctl" onClick={() => onChange(0)} disabled={atStart} aria-label="さいしょへ（Home）">
          <Icon d={ICONS.first} />
          <span>さいしょ</span>
        </button>
        <button type="button" className="ctl" onClick={() => onChange(current - 1)} disabled={atStart} aria-label="1つもどる（←）">
          <Icon d={ICONS.prev} />
          <span>もどる</span>
        </button>
        <button type="button" className="ctl ctl-play" onClick={onTogglePlay} aria-label={playing ? 'とめる（スペース）' : 'じどうで すすむ（スペース）'}>
          <Icon d={playing ? ICONS.pause : ICONS.play} />
          <span>{playing ? 'とめる' : atEnd ? 'もういちど' : 'じどう'}</span>
        </button>
        <button type="button" className="ctl ctl-next" onClick={() => onChange(current + 1)} disabled={atEnd} aria-label="1つすすむ（→）">
          <Icon d={ICONS.next} />
          <span>すすむ</span>
        </button>
        <button type="button" className="ctl" onClick={() => onChange(total)} disabled={atEnd} aria-label="さいごへ（End）">
          <Icon d={ICONS.last} />
          <span>さいご</span>
        </button>
      </div>
      <div className="control-track">
        <span className="step-count" aria-live="polite">
          <b>{current}</b> / {total} て
        </span>
        <input
          type="range"
          min={0}
          max={total}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="ステップの いち"
          style={{ ['--pct' as string]: `${total ? (current / total) * 100 : 0}%` }}
        />
        <div className="speed" role="radiogroup" aria-label="はやさ">
          {(Object.keys(SPEEDS) as Speed[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={speed === k}
              className={speed === k ? 'on' : ''}
              onClick={() => onSpeed(k)}
            >
              {SPEEDS[k].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
