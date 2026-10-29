import { STATS, STATS_SOURCE } from '../data/stats';
import { DISPLAY, col } from '../ui';

/** "Did you know?" band of FBI scam figures, on a navy card so it stands apart from the light page. */
export function StatsBand() {
  return (
    <section aria-labelledby="ss-stats-title" style={col(28, {
      position: 'relative', overflow: 'hidden', borderRadius: 32, color: '#fff', padding: 'clamp(28px, 3.5vw, 56px)',
      background: 'radial-gradient(80% 120% at 100% 0%, rgba(120,160,255,0.35), transparent 60%), linear-gradient(150deg,#1d4fa8 0%,#142a6e 55%,#0e1c4f 100%)',
    })}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div style={col(6)}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', color: '#a9c6ff' }}>DID YOU KNOW?</span>
          <h2 id="ss-stats-title" style={{ ...DISPLAY, margin: 0, fontSize: 'clamp(30px, 3vw, 44px)', lineHeight: 1.05, textWrap: 'balance' }}>Scams are a multi-billion-dollar business.</h2>
        </div>
        <span style={{ fontSize: 16, color: '#cfdcff', maxWidth: 380, lineHeight: 1.45 }}>A minute of practice here is a minute scammers can't use against you.</span>
      </div>
      <div className="ss-stats">
        {STATS.map(st => (
          <div key={st.value} style={col(8, { padding: '20px 22px', borderRadius: 24, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' })}>
            <span style={{ ...DISPLAY, fontSize: 'clamp(38px, 3.6vw, 56px)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{st.value}</span>
            <span style={{ fontSize: 16, lineHeight: 1.4, color: '#cfdcff' }}>{st.label}</span>
          </div>
        ))}
      </div>
      <span style={{ fontSize: 14, color: '#a9b8e6', lineHeight: 1.5 }}>
        Source: <a href={STATS_SOURCE.url} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>{STATS_SOURCE.label}</a>.
        {' '}Lost money to a scam? <a href={STATS_SOURCE.report} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>Report it to the FBI at ic3.gov</a>.
      </span>
    </section>
  );
}
