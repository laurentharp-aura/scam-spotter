import { C, DISPLAY, PrimaryButton, col } from '../ui';

// Calm on purpose: someone opening this may be mid-scam. No glow, no motion.
const HELP_STEPS = [
  { n: 1, title: 'Stop talking to them', body: "Hang up or close the message. It's okay to be rude." },
  { n: 2, title: "Don't send anything else", body: 'No money, gift cards, codes, or passwords.' },
  { n: 3, title: 'Call your bank yourself', body: 'Use the number on the back of your card.' },
];

export function Help() {
  return (
    <div data-screen-label="10 Immediate help" className="ss-narrow" style={col(16, { paddingBlock: '24px 48px' })}>
      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', color: '#ffc56b' }}>REAL HELP · NOT PART OF THE GAME</span>
      <h1 style={{ ...DISPLAY, margin: 0, fontSize: 40, lineHeight: 1.1 }}>Let's take this one step at a time.</h1>
      {HELP_STEPS.map(hs => (
        <div key={hs.n} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 14, padding: '16px 0', borderTop: `1px solid ${C.hair}` }}>
          <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>{hs.n}</span>
          <div style={col(4)}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{hs.title}</span>
            <span style={{ fontSize: 17, lineHeight: 1.5, color: C.sub }}>{hs.body}</span>
          </div>
        </div>
      ))}
      {/* TODO: wire to the Aura fraud-specialist line — the design doesn't specify a destination yet. */}
      <PrimaryButton size={19} style={{ marginTop: 8, minHeight: 58 }}>Talk to an Aura fraud specialist</PrimaryButton>
      <span style={{ fontSize: 15, color: C.faint, textAlign: 'center' }}>Free · 24/7</span>
    </div>
  );
}
