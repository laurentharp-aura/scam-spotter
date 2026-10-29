import { CallProtection } from '../ds/illustrations';
import { Icon } from '../ds/Icon';
import type { Game } from '../game/useGame';
import { C, PrimaryButton, SHADOW, TextButton, col } from '../ui';

const screen = (gap: number) => col(gap, { padding: '8px 24px 40px', minHeight: 'calc(100vh - 72px)' });
const WELCOME_POINTS = ['Pretend messages — nothing is real', 'No timer. Take your time.', 'Learn one new trick each round'];

export function Welcome({ game: { actions } }: { game: Game }) {
  return (
    <div data-screen-label="00a Welcome" style={screen(22)}>
      <div style={{ width: 180, height: 180, marginTop: 16, animation: 'ss-rise .4s ease-out both' }}>
        {/* The DS illustration is drawn at 268px; scale it into the 180px slot. */}
        <CallProtection style={{ transform: `scale(${180 / 268})`, transformOrigin: '0 0' }} />
      </div>
      <div style={col(6)}>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.blue }}>AURA · SCAM SPOTTER</span>
        <span style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.1 }}>Spot scams before they spot you.</span>
      </div>
      <span style={{ fontSize: 21, lineHeight: 1.45, color: '#263147', textWrap: 'pretty' }}>Practice spotting scams in pretend texts, emails, ads, and voicemails.</span>
      <div style={col(10)}>
        {WELCOME_POINTS.map(wp => (
          <div key={wp} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 18 }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="Checkmark" size={16} /></span>
            {wp}
          </div>
        ))}
      </div>
      <PrimaryButton size={22} onClick={() => actions.go('name')} style={{ marginTop: 'auto' }}>Let's start</PrimaryButton>
    </div>
  );
}

export function NameScreen({ game: { s, actions } }: { game: Game }) {
  return (
    <div data-screen-label="00b Name" style={screen(18)}>
      <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.2 }}>What should we call you?</span>
      <span style={{ fontSize: 18, color: C.muted }}>Just a first name. It stays on this device.</span>
      <input value={s.nameDraft} onChange={e => actions.setNameDraft(e.target.value)} placeholder="First name" autoFocus aria-label="First name"
        onKeyDown={e => { if (e.key === 'Enter') actions.saveName(); }}
        style={{ height: 64, borderRadius: 18, border: 'none', background: '#fff', padding: '0 18px', fontSize: 22, color: C.ink, outline: 'none' }} />
      <div style={col(10, { marginTop: 'auto' })}>
        <PrimaryButton size={22} onClick={actions.saveName}>Continue</PrimaryButton>
        <TextButton onClick={() => actions.go('how')}>Skip</TextButton>
      </div>
    </div>
  );
}

const HOW_STEPS = [
  { n: 1, title: 'Read a pretend message', body: 'Texts, emails, ads, and voicemails.', bg: '#ebf2ff' },
  { n: 2, title: 'Decide: real or scam?', body: 'One tap. Some messages really are real.', bg: '#fff5e5' },
  { n: 3, title: 'Tap the red flags', body: 'If it’s a scam, tap what gave it away.', bg: '#fff5e5' },
];

export function HowToPlay({ game: { s, actions } }: { game: Game }) {
  return (
    <div data-screen-label="00c How to play" style={screen(20)}>
      <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.2 }}>{s.name ? `Here's how it works, ${s.name}.` : "Here's how it works."}</span>
      {HOW_STEPS.map(hw => (
        <div key={hw.n} style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#fff', borderRadius: 24, boxShadow: SHADOW, padding: 16 }}>
          <span style={{ width: 48, height: 48, borderRadius: '50%', background: hw.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22, fontWeight: 600 }}>{hw.n}</span>
          <div style={col(2)}>
            <span style={{ fontSize: 19, fontWeight: 600 }}>{hw.title}</span>
            <span style={{ fontSize: 16, color: C.body }}>{hw.body}</span>
          </div>
        </div>
      ))}
      <span style={{ fontSize: 17, color: C.muted, lineHeight: 1.45 }}>6 levels · 3 rounds each · about a minute per round. Some messages are real.</span>
      <PrimaryButton size={22} onClick={actions.finishOnboarding} style={{ marginTop: 'auto' }}>Start a practice round</PrimaryButton>
    </div>
  );
}
