import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './ds/Icon';
import type { BadgeView } from './game/useGame';

/**
 * Two palettes:
 * - page colours (bg … hair) for the dark, aura.com-style app chrome;
 * - mockup ink (ink … border) for the light phone/email mockups, which stay white like real screens.
 */
export const C = {
  bg: '#121212', surface: '#1d1d1f', surface2: '#2a2a2d', text: '#ffffff', sub: '#b9b9c2', faint: '#8a8a94', hair: 'rgba(255,255,255,0.10)',
  link: '#8fb0ff', peach: '#FCD9A8',
  ink: '#0B132B', muted: '#4c5a70', body: '#39465e', line: '#edf1f7', border: '#cfd7e3',
  blue: '#2A5FFC', navy: '#192f70', orange: '#FFA722', teal: '#25DAA7',
};
export const SHADOW = '0 1px 2px rgba(0,0,0,0.3),0 12px 32px rgba(0,0,0,0.35)';
/** aura.com's periwinkle-to-peach band. */
export const PASTEL = 'linear-gradient(160deg,#A9BCFF 0%,#D6C8F4 48%,#FCD9A8 100%)';
export const DISPLAY: CSSProperties = { fontFamily: "'Inter Tight','Inter',system-ui,sans-serif", letterSpacing: '-0.035em', fontWeight: 600 };

export const col = (gap: number, extra?: CSSProperties): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap, ...extra });
export const kicker = (size = 14, color = C.faint): CSSProperties => ({ fontSize: size, fontWeight: 500, letterSpacing: '0.08em', color });

type BtnProps = { onClick?: () => void; disabled?: boolean; children: ReactNode; style?: CSSProperties; className?: string };

/** Blue filled pill, as on aura.com's "Start free trial". */
export function PrimaryButton({ onClick, disabled, children, style, size = 20 }: BtnProps & { size?: number; shadow?: boolean }) {
  return (
    <button className="ss-btn" onClick={onClick} disabled={disabled} style={{
      minHeight: size >= 22 ? 62 : 60, borderRadius: 999, border: 'none', background: C.blue, color: '#fff', fontSize: size,
      fontWeight: 600, cursor: 'pointer', ...style,
    }}>{children}</button>
  );
}

export function TextButton({ onClick, children, style }: BtnProps) {
  return (
    <button onClick={onClick} style={{ minHeight: 48, border: 'none', background: 'none', fontSize: 17, fontWeight: 600, color: C.link, cursor: 'pointer', ...style }}>
      {children}
    </button>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 24, ...style }}>{children}</div>;
}

/** The Solstice rainbow arc, as a soft glow behind hero content. The parent needs position: relative + overflow: hidden. */
export function Glow({ at = 'bottom', style }: { at?: 'bottom' | 'top'; style?: CSSProperties }) {
  return <div aria-hidden="true" className={`ss-glow ss-glow-${at}`} style={style} />;
}

/** A word set in a white pill inside a headline, like aura.com's "your [identity] staying safe". */
export function PillWord({ icon, children }: { icon?: 'Shield' | 'Search3'; children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.18em', background: '#fff', color: C.ink, borderRadius: 999, padding: '0.02em 0.32em 0.06em', verticalAlign: '0.04em', lineHeight: 1.1 }}>
      {icon && <Icon name={icon} size={0} style={{ width: '0.72em', height: '0.72em' }} />}{children}
    </span>
  );
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

/** Status pill with a coloured dot (SCAM / REAL / Badge earned). */
export function Pill({ good, children, style }: { good: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, fontSize: 15, fontWeight: 600,
      background: good ? 'rgba(37,218,167,0.14)' : 'rgba(255,167,34,0.14)', color: good ? '#7ff0cf' : '#ffc56b', ...style,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: good ? C.teal : C.orange }} />{children}
    </span>
  );
}
