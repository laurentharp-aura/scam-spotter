import type { ReactNode } from 'react';
import { ROUNDS } from '../data/content';
import { Icon, type IconName } from '../ds/Icon';
import type { Game } from '../game/useGame';
import { C, DISPLAY, Glow, PillWord, PrimaryButton, TextButton, col } from '../ui';

const screen = (gap: number) => col(gap, { paddingBlock: '8px 40px' });
const WELCOME_POINTS = ['Pretend messages — nothing is real', 'No timer. Take your time.', 'Learn one new trick each round'];

/** A lock-screen notification, like the floating cards on aura.com. */
function Notice({ app, icon, iconBg, when, title, children, dark }: { app: string; icon: IconName; iconBg: string; when: string; title: string; children: ReactNode; dark?: boolean }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 22, maxWidth: 380, width: '100%',
      background: dark ? 'rgba(40,40,44,0.72)' : 'rgba(255,255,255,0.94)', color: dark ? '#fff' : C.ink,
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
      boxShadow: '0 18px 40px rgba(0,0,0,0.35)', fontFamily: "-apple-system,'SF Pro Text',system-ui,sans-serif",
    }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={20} /></span>
      <div style={col(2, { flex: 1, minWidth: 0 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, opacity: 0.7 }}><span>{app}</span><span>{when}</span></div>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 15, lineHeight: 1.35 }}>{children}</span>
      </div>
    </div>
  );
}

export function Welcome({ game: { actions } }: { game: Game }) {
  return (
    <div data-screen-label="00a Welcome" style={{ paddingBlock: '12px 40px' }}>
      <div className="ss-hero" style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, background: '#0a0a0b', border: `1px solid ${C.hair}` }}>
        <Glow />
        <div className="ss-welcome" style={{ position: 'relative' }}>
          <div style={col(22)}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.08em', color: C.link }}>AURA · SCAM SPOTTER</span>
            <h1 style={{ ...DISPLAY, margin: 0, fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.02, textWrap: 'balance' }}>
              Spot the <PillWord icon="Shield">scam</PillWord> before it spots you.
            </h1>
            <span style={{ fontSize: 20, lineHeight: 1.45, color: C.sub, textWrap: 'pretty', maxWidth: 480 }}>Practice on pretend texts, emails, ads, and voicemails. Learn the tells in about a minute a round.</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px' }}>
              {WELCOME_POINTS.map(wp => (
                <span key={wp} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: C.sub }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: C.teal, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="Checkmark" size={12} /></span>
                  {wp}
                </span>
              ))}
            </div>
            <PrimaryButton size={21} onClick={() => actions.go('name')} style={{ marginTop: 8, maxWidth: 320, minHeight: 58 }}>Let's start</PrimaryButton>
          </div>
          <div className="ss-notices" aria-hidden="true">
            <div style={{ animation: 'ss-rise .5s ease-out .1s both' }}>
              <Notice app="Messages" icon="Message" iconBg="#34c759" when="now" title="+1 (938) 555‑0142">FedEx: Your package is on hold. Pay $1.99 within 24 hrs: fdx-ship.co/pay</Notice>
            </div>
            <div style={{ animation: 'ss-rise .5s ease-out .5s both', alignSelf: 'flex-end' }}>
              <Notice dark app="Scam Spotter" icon="Shield" iconBg={C.blue} when="now" title="Nice catch.">Odd number, tiny fee, deadline and a fake link. That's a scam.</Notice>
            </div>
            <span style={{ alignSelf: 'flex-end', background: '#0a84ff', color: '#fff', borderRadius: '20px 20px 6px 20px', padding: '10px 16px', fontSize: 16, maxWidth: 280, animation: 'ss-rise .5s ease-out .9s both', fontFamily: "-apple-system,'SF Pro Text',system-ui,sans-serif" }}>
              Glad I didn't tap that link 🙏
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NameScreen({ game: { s, actions } }: { game: Game }) {
  return (
    <div data-screen-label="00b Name" className="ss-narrow ss-fill" style={screen(18)}>
      <span style={{ ...DISPLAY, fontSize: 40, lineHeight: 1.1 }}>What should we call you?</span>
      <span style={{ fontSize: 18, color: C.sub }}>Just a first name. It stays on this device.</span>
      <input id="first-name" value={s.nameDraft} onChange={e => actions.setNameDraft(e.target.value)} placeholder="First name" autoFocus aria-label="First name"
        onKeyDown={e => { if (e.key === 'Enter') actions.saveName(); }}
        style={{ height: 64, borderRadius: 18, border: `1px solid ${C.hair}`, background: C.surface, padding: '0 18px', fontSize: 22, color: C.text, outline: 'none' }} />
      <div style={col(10, { marginTop: 'auto' })}>
        <PrimaryButton size={21} onClick={actions.saveName}>Continue</PrimaryButton>
        <TextButton onClick={() => actions.go('how')}>Skip</TextButton>
      </div>
    </div>
  );
}

const HOW_STEPS = [
  { n: 1, title: 'Read a pretend message', body: 'Texts, emails, messages, ads, and voicemails.' },
  { n: 2, title: 'Decide: real or scam?', body: 'One tap. Some messages really are real.' },
  { n: 3, title: 'Tap the red flags', body: 'If it’s a scam, tap what gave it away — an odd link, a deadline, a request for money.' },
];

export function HowToPlay({ game: { s, actions } }: { game: Game }) {
  return (
    <div data-screen-label="00c How to play" className="ss-narrow ss-fill" style={screen(16)}>
      <span style={{ ...DISPLAY, fontSize: 40, lineHeight: 1.1, marginBottom: 8 }}>{s.name ? `Here's how it works, ${s.name}.` : "Here's how it works."}</span>
      {HOW_STEPS.map(hw => (
        <div key={hw.n} style={{ display: 'flex', gap: 16, alignItems: 'center', background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 24, padding: 18 }}>
          <span style={{ ...DISPLAY, width: 48, height: 48, borderRadius: '50%', background: '#fff', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>{hw.n}</span>
          <div style={col(2)}>
            <span style={{ fontSize: 19, fontWeight: 600 }}>{hw.title}</span>
            <span style={{ fontSize: 16, color: C.sub, lineHeight: 1.4 }}>{hw.body}</span>
          </div>
        </div>
      ))}
      <span style={{ fontSize: 17, color: C.faint, lineHeight: 1.45 }}>6 levels · {ROUNDS.length} rounds · about a minute each. Some messages are real.</span>
      <PrimaryButton size={21} onClick={actions.finishOnboarding} style={{ marginTop: 'auto' }}>Start a practice round</PrimaryButton>
    </div>
  );
}
