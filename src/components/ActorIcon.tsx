import type { ActorIcon as Kind } from '../protocols/types';

const INK = '#2d2a32';

function Face({ cx, cy, s = 1 }: { cx: number; cy: number; s?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <circle cx="-9" cy="0" r="3.6" fill={INK} />
      <circle cx="9" cy="0" r="3.6" fill={INK} />
      <circle cx="-7.8" cy="-1.3" r="1.2" fill="#fff" />
      <circle cx="10.2" cy="-1.3" r="1.2" fill="#fff" />
      <ellipse cx="-15" cy="6" rx="3.5" ry="2.2" fill="#ff7aa2" opacity="0.7" />
      <ellipse cx="15" cy="6" rx="3.5" ry="2.2" fill="#ff7aa2" opacity="0.7" />
      <path d="M-4 6 Q0 10 4 6" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

/** 通信する「ひと」（機器）のキャラクター。viewBox 0 0 100 100 */
export function ActorIconShape({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'laptop':
      return (
        <g>
          <rect x="18" y="16" width="64" height="46" rx="8" fill="#dff3ff" stroke={INK} strokeWidth="3" />
          <rect x="24" y="22" width="52" height="34" rx="4" fill="#fff" />
          <Face cx={50} cy={38} />
          <path d="M8 66 H92 L84 80 H16 Z" fill="#b8c7d9" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <rect x="42" y="69" width="16" height="4" rx="2" fill={INK} opacity="0.4" />
        </g>
      );
    case 'server':
      return (
        <g>
          <rect x="24" y="6" width="52" height="82" rx="9" fill="#e8e1ff" stroke={INK} strokeWidth="3" />
          <rect x="30" y="14" width="40" height="30" rx="5" fill="#fff" />
          <Face cx={50} cy={29} s={0.9} />
          {[52, 62, 72].map((y) => (
            <g key={y}>
              <rect x="30" y={y} width="40" height="7" rx="3" fill="#c9bdf5" stroke={INK} strokeWidth="2" />
              <circle cx="64" cy={y + 3.5} r="1.8" fill="#2ecc71" />
            </g>
          ))}
        </g>
      );
    case 'eve':
      return (
        <g>
          {/* 盗聴者イブ: 探偵帽と虫めがね。目は横を見ている */}
          <circle cx="50" cy="56" r="30" fill="#f3e6ff" stroke={INK} strokeWidth="3" />
          <path d="M18 34 H82" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M28 34 Q30 10 50 10 Q70 10 72 34 Z" fill="#6c5ce7" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <rect x="29" y="26" width="42" height="6" fill="#ffd23f" />
          <ellipse cx="40" cy="54" rx="6" ry="6.5" fill="#fff" stroke={INK} strokeWidth="2" />
          <ellipse cx="60" cy="54" rx="6" ry="6.5" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="43" cy="55" r="3.2" fill={INK} />
          <circle cx="63" cy="55" r="3.2" fill={INK} />
          <ellipse cx="33" cy="66" rx="4" ry="2.4" fill="#ff7aa2" opacity="0.7" />
          <ellipse cx="67" cy="66" rx="4" ry="2.4" fill="#ff7aa2" opacity="0.7" />
          <path d="M45 70 Q50 67 55 70" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M80 74 L92 88" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="76" cy="69" r="9" fill="#d6f2ff" fillOpacity="0.85" stroke={INK} strokeWidth="3" />
        </g>
      );
    case 'authenticator':
      return (
        <g>
          {/* 認証器: 指紋マークのあるスマホ。秘密鍵をしまっている */}
          <rect x="28" y="6" width="44" height="84" rx="10" fill="#fff1d6" stroke={INK} strokeWidth="3" />
          <rect x="34" y="16" width="32" height="40" rx="5" fill="#fff" />
          <Face cx={50} cy={34} s={0.75} />
          <g fill="none" stroke="#b8650a" strokeWidth="2.2" strokeLinecap="round">
            <path d="M42 76 a8 8 0 0 1 16 0" />
            <path d="M45 77 a5 5 0 0 1 10 0" />
            <path d="M38 75 a12 12 0 0 1 24 0" />
            <path d="M50 74 v6" />
          </g>
          <circle cx="76" cy="18" r="9" fill="#ffd23f" stroke={INK} strokeWidth="2" />
          <rect x="72.5" y="17" width="7" height="6" rx="1.5" fill={INK} />
          <path d="M74 17 v-2 a2 2 0 0 1 4 0 v2" fill="none" stroke={INK} strokeWidth="1.6" />
        </g>
      );
    case 'router':
      return (
        <g>
          <path d="M30 40 L24 12 M70 40 L76 12" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="24" cy="11" r="4" fill="#ffd23f" stroke={INK} strokeWidth="2" />
          <circle cx="76" cy="11" r="4" fill="#ffd23f" stroke={INK} strokeWidth="2" />
          <rect x="10" y="38" width="80" height="44" rx="12" fill="#d7fbe8" stroke={INK} strokeWidth="3" />
          <Face cx={50} cy={56} />
          {[24, 32, 68, 76].map((x) => (
            <circle key={x} cx={x} cy="72" r="2.2" fill="#2ecc71" />
          ))}
        </g>
      );
  }
}
