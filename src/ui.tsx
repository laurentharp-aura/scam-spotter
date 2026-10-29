import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './ds/Icon';
import type { BadgeView } from './game/useGame';

/**
 * Two palettes:
 * - page colours (bg … hair) for the light, Aura-blue page;
 * - mockup ink (ink … border) for the light phone/email mockups, which stay white like real screens.
 */
export const C = {
  bg: '#eef3fc', surface: '#ffffff', surface2: '#edf1f7', text: '#0B132B', sub: '#4c5a70', faint: '#6c7c93', hair: 'rgba(11,19,43,0.08)',
  link: '#2A5FFC', sky: '#2A5FFC', locked: '#cfd7e3', outline: 'rgba(11,19,43,0.22)', mark: '#0b1430',
  /** Hero cards: white fading into Aura's light periwinkle. */
  hero: 'linear-gradient(160deg,#ffffff 0%,#eef3ff 55%,#d9e5ff 100%)',
  ink: '#0B132B', muted: '#4c5a70', body: '#39465e', line: '#edf1f7', border: '#cfd7e3',
  blue: '#2A5FFC', navy: '#192f70', orange: '#FFA722', teal: '#25DAA7',
};
export const SHADOW = '0 1px 2px rgba(25,47,112,0.06),0 10px 30px rgba(25,47,112,0.10)';
/** The light Aura app-icon gradient: periwinkle to white. */
export const PASTEL = 'linear-gradient(135deg,#a9c6ff 0%,#cfdfff 50%,#f2f6ff 100%)';
/** Editorial serif for page headlines, like aura.com's free-tool pages. */
export const SERIF: CSSProperties = { fontFamily: "'Source Serif 4',Georgia,serif", fontWeight: 400, letterSpacing: '-0.01em' };
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
  return <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 24, boxShadow: SHADOW, ...style }}>{children}</div>;
}

/** A soft blue bloom behind hero content. The parent needs position: relative + overflow: hidden. */
export function Glow({ at = 'bottom', style }: { at?: 'bottom' | 'top'; style?: CSSProperties }) {
  return <div aria-hidden="true" className={`ss-glow ss-glow-${at}`} style={style} />;
}

/**
 * The ĀURA wordmark, drawn as a stand-in: Λ-shaped A's with a bar over the first.
 * Swap in the official logo SVG from brand when available.
 */
export function Wordmark({ color = '#fff', height = 22 }: { color?: string; height?: number }) {
  return (
    <svg height={height} viewBox="0 0 84 22" fill="none" role="img" aria-label="Aura">
      <rect x="2" y="0" width="12" height="2" fill={color} />
      <path d="M1 21.5 L8 5 L15 21.5" stroke={color} strokeWidth="2" />
      <path d="M23 5 V15 a6 6 0 0 0 12 0 V5" stroke={color} strokeWidth="2" />
      <path d="M44 21.5 V5 h6.5 a4.8 4.8 0 0 1 0 9.6 H44 M50.5 14.6 L56 21.5" stroke={color} strokeWidth="2" />
      <path d="M62 21.5 L69 5 L76 21.5" stroke={color} strokeWidth="2" />
    </svg>
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
      background: good ? '#ebfaf6' : '#fff5e5', color: good ? '#22705a' : '#96600f', ...style,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: good ? C.teal : C.orange }} />{children}
    </span>
  );
}
