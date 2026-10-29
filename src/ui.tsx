import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './ds/Icon';
import type { BadgeView } from './game/useGame';

export const C = {
  ink: '#0B132B', blue: '#2A5FFC', navy: '#192f70', page: '#EEF3FC',
  muted: '#4c5a70', body: '#39465e', faint: '#6c7c93', line: '#edf1f7', border: '#cfd7e3',
  orange: '#FFA722', teal: '#25DAA7',
};
export const SHADOW = '0 1px 2px rgba(25,47,112,0.04),0 8px 24px rgba(25,47,112,0.07)';
export const HERO = 'radial-gradient(120% 90% at 100% 0%,rgba(42,95,252,0.75) 0%,rgba(42,95,252,0) 60%),linear-gradient(150deg,#192F70 0%,#141E37 100%)';
export const NAVY = 'linear-gradient(150deg,#192F70 0%,#141E37 100%)';

export const col = (gap: number, extra?: CSSProperties): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap, ...extra });
export const kicker = (size = 14, color = C.body): CSSProperties => ({ fontSize: size, fontWeight: 500, letterSpacing: '0.08em', color });

type BtnProps = { onClick?: () => void; disabled?: boolean; children: ReactNode; style?: CSSProperties; className?: string };

/** Full-width blue pill. `size` sets font size; heights follow the prototype (60px, or 62px at 22px type). */
export function PrimaryButton({ onClick, disabled, children, style, size = 20, shadow = true }: BtnProps & { size?: number; shadow?: boolean }) {
  return (
    <button className="ss-btn" onClick={onClick} disabled={disabled} style={{
      minHeight: size >= 22 ? 62 : 60, borderRadius: 999, border: 'none', background: C.blue, color: '#fff', fontSize: size,
      fontWeight: 600, cursor: 'pointer', boxShadow: shadow ? SHADOW : undefined, ...style,
    }}>{children}</button>
  );
}

export function TextButton({ onClick, children, style }: BtnProps) {
  return (
    <button onClick={onClick} style={{ minHeight: 48, border: 'none', background: 'none', fontSize: 17, fontWeight: 600, color: C.blue, cursor: 'pointer', ...style }}>
      {children}
    </button>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: '#fff', border: 'none', borderRadius: 24, boxShadow: SHADOW, ...style }}>{children}</div>;
}

/** Level badge: an outer ring + coloured core. Core ≈ 62% of outer, as in every prototype instance. */
export function Medallion({ b, size, core, icon }: { b: BadgeView; size: number; core: number; icon: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: b.fill, border: `3px ${b.ringStyle} ${b.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: core, height: core, borderRadius: '50%', background: b.core, color: b.iconFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={b.icon} size={icon} />
      </div>
    </div>
  );
}

/** Status pill with a coloured dot (SCAM / REAL / SAFE / Badge earned). */
export function Pill({ bg, fg, dot, children, style }: { bg: string; fg: string; dot: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: bg, color: fg, fontSize: 15, fontWeight: 500, ...style }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />{children}
    </span>
  );
}
