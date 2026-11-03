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
