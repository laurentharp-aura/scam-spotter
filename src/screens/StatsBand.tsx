import { STATS, STATS_SOURCE } from '../data/stats';
import { HERO, SHADOW, col } from '../ui';

/** "Did you know?" card of FBI scam figures. */
export function StatsBand() {
  return (
    <section aria-labelledby="ss-stats-title" style={col(14, { background: HERO, color: '#fff', borderRadius: 28, boxShadow: SHADOW, padding: 20 })}>
      <div style={col(4)}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: '#B79CFF' }}>DID YOU KNOW?</span>
        <span id="ss-stats-title" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>Scams are a multi-billion-dollar business.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {STATS.map(st => (
          <div key={st.value} style={col(4, { padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.08)' })}>
            <span style={{ fontSize: 26, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{st.value}</span>
            <span style={{ fontSize: 13, lineHeight: 1.35, color: '#cfe0ff' }}>{st.label}</span>
          </div>
        ))}
      </div>
      <span style={{ fontSize: 12, color: '#a3aebf', lineHeight: 1.5 }}>
        Source: <a href={STATS_SOURCE.url} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>{STATS_SOURCE.label}</a>. Lost money? <a href={STATS_SOURCE.report} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>Report it at ic3.gov</a>.
      </span>
    </section>
  );
}
