import { C, PrimaryButton, col } from '../ui';

// Calm on purpose: someone opening this may be mid-scam.
const HELP_STEPS = [
  { n: 1, title: 'Stop talking to them', body: "Hang up or close the message. It's okay to be rude." },
  { n: 2, title: "Don't send anything else", body: 'No money, gift cards, codes, or passwords.' },
  { n: 3, title: 'Call your bank yourself', body: 'Use the number on the back of your card.' },
];

export function Help() {
  return (
    <div data-screen-label="10 Immediate help" className="ss-narrow" style={col(16, { paddingBlock: '4px 48px' })}>
      <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.08em', color: '#96600f' }}>REAL HELP · NOT PART OF THE GAME</span>
      <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.2 }}>Let's take this one step at a time.</span>
      {HELP_STEPS.map(hs => (
        <div key={hs.n} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 14, padding: '14px 0', borderTop: `1px solid ${C.line}` }}>
          <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#ebf2ff', color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>{hs.n}</span>
          <div style={col(4)}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{hs.title}</span>
            <span style={{ fontSize: 17, lineHeight: 1.5, color: C.body }}>{hs.body}</span>
          </div>
        </div>
      ))}
      {/* TODO: wire to the Aura fraud-specialist line — the design doesn't specify a destination yet. */}
      <PrimaryButton size={19} shadow={false} style={{ marginTop: 8, minHeight: 58 }}>Talk to an Aura fraud specialist</PrimaryButton>
      <span style={{ fontSize: 15, color: C.muted, textAlign: 'center' }}>Free · 24/7</span>
    </div>
  );
}
