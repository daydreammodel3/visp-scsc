import type { Accessory } from '../protocols/types';

const INK = '#2d2a32';

interface Props {
  color: string;
  accessory: Accessory;
  encrypted?: boolean;
  /** 足をパタパタさせる */
  walking?: boolean;
  /** 0〜1。歩きアニメーションの位相（JS 側から渡す） */
  phase?: number;
  title?: string;
}

/**
 * パケットのミニキャラ。封筒のからだに顔と足、役割をあらわす小物を持つ。
 * viewBox は 0 0 100 100。外側の <svg> や <g> で大きさを決める。
 */
export function PacketBuddyShape({ color, accessory, encrypted, walking, phase = 0 }: Props) {
  const swing = walking ? Math.sin(phase * Math.PI * 2) * 5 : 0;
  return (
    <g>
      <ellipse cx="50" cy="94" rx="26" ry="4" fill="#000" opacity="0.12" />
      {/* あし */}
      <rect x={34 + swing} y="78" width="11" height="13" rx="5.5" fill={INK} />
      <rect x={55 - swing} y="78" width="11" height="13" rx="5.5" fill={INK} />
      {/* アホ毛 */}
      {!HEAD_ITEMS.has(accessory) && (
        <path d="M50 26 C 48 16, 58 14, 56 8" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      )}
      {/* からだ（封筒） */}
      <rect x="14" y="24" width="72" height="58" rx="17" fill={color} stroke={INK} strokeWidth="3" />
      <path d="M17 34 L50 58 L83 34" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* かお */}
      <circle cx="37" cy="55" r="6.5" fill={INK} />
      <circle cx="63" cy="55" r="6.5" fill={INK} />
      <circle cx="39.3" cy="52.7" r="2.4" fill="#fff" />
      <circle cx="65.3" cy="52.7" r="2.4" fill="#fff" />
      <ellipse cx="27" cy="65" rx="5.5" ry="3.5" fill="#ff7aa2" opacity="0.7" />
      <ellipse cx="73" cy="65" rx="5.5" ry="3.5" fill="#ff7aa2" opacity="0.7" />
      <path d="M45 66 Q50 71.5 55 66" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <AccessoryShape kind={accessory} wave={walking ? phase : 0} />
      {encrypted && <Shield />}
    </g>
  );
}

const HEAD_ITEMS = new Set<Accessory>(['box', 'bell', 'check', 'gear', 'moon']);

function Shield() {
  return (
    <g>
      <rect x="6" y="15" width="88" height="76" rx="26" fill="#9be7ff" fillOpacity="0.16" stroke="#3aa8d8" strokeWidth="2.5" strokeDasharray="6 5" />
      {/* 南京錠 */}
      <g transform="translate(70 66)">
        <path d="M5 9 V4 a7 7 0 0 1 14 0 V9" fill="none" stroke={INK} strokeWidth="3" />
        <rect x="1" y="8" width="22" height="18" rx="4" fill="#ffd23f" stroke={INK} strokeWidth="2.5" />
        <circle cx="12" cy="16" r="2.6" fill={INK} />
        <rect x="11" y="16" width="2" height="5" fill={INK} />
      </g>
    </g>
  );
}

function AccessoryShape({ kind, wave }: { kind: Accessory; wave: number }) {
  switch (kind) {
    case 'wave': {
      const a = Math.sin(wave * Math.PI * 4) * 12;
      return (
        <g transform={`rotate(${a} 86 46)`}>
          <path d="M84 46 L92 28" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="93" cy="25" r="7" fill="#ffe0bd" stroke={INK} strokeWidth="2.5" />
          <path d="M99 14 q4 3 3 8 M87 13 q-2 -3 0 -6" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    }
    case 'key':
      return (
        <g transform="rotate(-25 90 46)">
          <circle cx="90" cy="34" r="8" fill="#ffd23f" stroke={INK} strokeWidth="2.5" />
          <circle cx="90" cy="34" r="3" fill="#fff" stroke={INK} strokeWidth="1.5" />
          <rect x="88" y="41" width="4.5" height="20" rx="2" fill="#ffd23f" stroke={INK} strokeWidth="2" />
          <rect x="92" y="51" width="6" height="4" fill="#ffd23f" stroke={INK} strokeWidth="1.5" />
          <rect x="92" y="56" width="4" height="4" fill="#ffd23f" stroke={INK} strokeWidth="1.5" />
        </g>
      );
    case 'scroll':
      return (
        <g transform="rotate(12 88 48)">
          <rect x="78" y="30" width="20" height="30" rx="3" fill="#fffaf0" stroke={INK} strokeWidth="2.5" />
          <path d="M82 37 h12 M82 42 h12 M82 47 h8" stroke="#9aa5b1" strokeWidth="2" strokeLinecap="round" />
          <circle cx="92" cy="54" r="5" fill="#ee5253" stroke={INK} strokeWidth="2" />
        </g>
      );
    case 'pen':
      return (
        <g transform="rotate(30 90 40)">
          <rect x="86" y="18" width="8" height="34" rx="3" fill="#5f27cd" stroke={INK} strokeWidth="2.5" />
          <path d="M86 52 L90 62 L94 52 Z" fill="#ffe0bd" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <rect x="86" y="18" width="8" height="6" rx="2" fill="#fff" stroke={INK} strokeWidth="2" />
        </g>
      );
    case 'flag':
      return (
        <g>
          <path d="M86 70 V8" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M86 9 L104 15 L86 23 Z" fill="#ff4d8d" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="86" cy="7" r="3" fill="#ffd23f" stroke={INK} strokeWidth="1.5" />
        </g>
      );
    case 'box':
      return (
        <g>
          <rect x="30" y="2" width="40" height="24" rx="3" fill="#e5b07a" stroke={INK} strokeWidth="2.5" />
          <path d="M50 2 V26 M30 12 H70" stroke="#c0392b" strokeWidth="3" />
        </g>
      );
    case 'bell': {
      const a = Math.sin(wave * Math.PI * 6) * 15;
      return (
        <g transform={`rotate(${a} 50 6)`}>
          <path d="M38 24 Q38 6 50 6 Q62 6 62 24 Z" fill="#ffd23f" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="35" y="22" width="30" height="4" rx="2" fill="#ffd23f" stroke={INK} strokeWidth="2" />
          <circle cx="50" cy="4" r="2.5" fill={INK} />
        </g>
      );
    }
    case 'check':
      return (
        <g>
          <circle cx="50" cy="12" r="11" fill="#2ecc71" stroke={INK} strokeWidth="2.5" />
          <path d="M44 12 L49 17 L57 7" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'gear':
      return (
        <g transform={`rotate(${wave * 360} 50 13)`}>
          <circle cx="50" cy="13" r="11" fill="#c8d6e5" stroke={INK} strokeWidth="2.5" strokeDasharray="5 3" />
          <circle cx="50" cy="13" r="7" fill="#c8d6e5" stroke={INK} strokeWidth="2.5" />
          <circle cx="50" cy="13" r="2.5" fill={INK} />
        </g>
      );
    case 'ticket':
      return (
        <g transform="rotate(-15 90 44)">
          <rect x="78" y="34" width="24" height="15" rx="2" fill="#ffd23f" stroke={INK} strokeWidth="2.5" />
          <path d="M86 34 V49" stroke={INK} strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="94" cy="41.5" r="3" fill="#ee5253" />
        </g>
      );
    case 'moon':
      return (
        <g>
          {/* ナイトキャップ */}
          <path d="M28 28 Q40 0 72 8 Q60 14 70 28 Z" fill="#54a0ff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="74" cy="8" r="5" fill="#fff" stroke={INK} strokeWidth="2" />
          <path d="M84 24 a6 6 0 1 0 6 8 a5 5 0 1 1 -6 -8 z" fill="#ffd23f" stroke={INK} strokeWidth="1.5" />
        </g>
      );
  }
}

/** 単体で使える SVG 版 */
export function PacketBuddy(props: Props & { size?: number; className?: string; flip?: boolean }) {
  const { size = 96, className, flip, title, ...rest } = props;
  return (
    <svg
      viewBox="-6 -6 116 106"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title ?? 'パケットのキャラクター'}
      style={{ overflow: 'visible' }}
    >
      <g transform={flip ? 'translate(104 0) scale(-1 1)' : undefined}>
        <PacketBuddyShape {...rest} />
      </g>
    </svg>
  );
}
