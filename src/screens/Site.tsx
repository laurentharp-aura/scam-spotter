import type { ReactNode } from 'react';
import { LEVELS, ROUNDS } from '../data/content';
import { Icon } from '../ds/Icon';
import { badgeView, isDone, roundNumber, roundsInLevel, type Game } from '../game/useGame';
import { C, DISPLAY, Medallion, SERIF, SHADOW, Wordmark, col } from '../ui';
import { LevelComplete } from './LevelComplete';
import { RoundScreen } from './Round';

const AURA = 'https://www.aura.com';
const ghost = { display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 18px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.85)', color: '#fff', fontSize: 16, fontWeight: 600, textDecoration: 'none', background: 'transparent' } as const;
const kick = (color: string) => ({ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color }) as const;

// ---------------------------------------------------------------- hero

export function Hero() {
  return (
    <header className="ss-hero">
      <div className="ss-wrap" style={col(0)}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBlock: 24 }}>
          <a href={AURA} aria-label="Aura home" style={{ display: 'flex' }}><Wordmark /></a>
          <span style={{ display: 'flex', gap: 10 }}>
            <a className="ss-ghost" href="#help" style={ghost}>Need help?</a>
            <a className="ss-ghost" href={AURA} style={ghost}>About Aura</a>
          </span>
        </nav>
        <div style={col(16, { paddingTop: 'clamp(24px, 4vw, 56px)', maxWidth: 760 })}>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
            <a href={AURA} style={{ color: 'inherit', textDecoration: 'none' }}>Home</a> / Free tools / <span style={{ color: '#fff', fontWeight: 600 }}>Scam Spotter</span>
          </span>
          <h1 style={{ ...SERIF, margin: 0, fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1.08 }}>Scam Spotter: test your scam instincts</h1>
          <p style={{ margin: 0, fontSize: 'clamp(18px, 1.6vw, 21px)', lineHeight: 1.5, color: 'rgba(255,255,255,0.88)', maxWidth: 640 }}>
            Scammers take billions every year with fake texts, emails, ads and voicemails. Practice spotting the red flags across 6 levels, about a minute a round. Every message is pretend.
          </p>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- game card

export function GameCard({ game }: { game: Game }) {
  const { s, round, actions } = game;
  const lvl = s.screen === 'complete' ? s.doneLevel : round.lvl;
  const total = ROUNDS.filter((_, i) => isDone(s, i)).length;
  return (
    <section id="ss-game" aria-label="Scam Spotter game" style={col(20, { background: '#fff', borderRadius: 28, boxShadow: '0 2px 4px rgba(25,47,112,0.06),0 24px 60px rgba(25,47,112,0.16)', padding: 'clamp(18px, 2.2vw, 32px)', scrollMarginTop: 16 })}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 16px' }}>
        <div style={col(2)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ ...DISPLAY, fontSize: 24 }}>{s.cur === 0 && s.screen === 'round' ? 'Practice round' : `Level ${lvl}: ${LEVELS[lvl - 1][0]}`}</span>
            {s.screen === 'round' && <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: C.blue, background: '#ebf2ff', borderRadius: 999, padding: '4px 10px' }}>ROUND {roundNumber(s.cur)} OF {roundsInLevel(lvl).length}</span>}
          </span>
          <span style={{ fontSize: 15, color: C.sub }}>{LEVELS[lvl - 1][1]}</span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: C.faint }}>
          {total} of {ROUNDS.length} rounds done
          {total > 0 && <button className="ss-link" onClick={actions.resetAll} style={{ border: 'none', background: 'none', padding: 0, fontSize: 14, fontWeight: 600, color: C.link, cursor: 'pointer' }}>Start over</button>}
        </span>
      </div>

      <div className="ss-tabs" role="tablist" aria-label="Levels">
        {LEVELS.map(([title], li) => {
          const n = li + 1, idxs = roundsInLevel(n), on = n === lvl, doneN = idxs.filter(i => isDone(s, i)).length;
          return (
            <button key={n} role="tab" aria-selected={on} className="ss-lift" onClick={() => actions.playLevel(n)} style={{
              ...col(4), alignItems: 'flex-start', textAlign: 'left', padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
              border: 'none', background: on ? C.blue : C.bg, color: on ? '#fff' : C.text,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', opacity: on ? 0.85 : 0.6 }}>LEVEL {n}</span>
              <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.15 }}>{title}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, opacity: 0.8 }}>
                {idxs.map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: isDone(s, i) ? C.teal : on ? 'rgba(255,255,255,0.45)' : C.locked }} />)}
                <span style={{ marginLeft: 4 }}>{doneN === idxs.length ? 'Done' : `${doneN} of ${idxs.length}`}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: `1px solid ${C.hair}`, paddingTop: 20 }}>
        {s.screen === 'round' ? <RoundScreen game={game} /> : <LevelComplete game={game} />}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- sections

function SectionHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <div style={col(6)}>
        <span style={kick(C.blue)}>{kicker}</span>
        <h2 style={{ ...SERIF, margin: 0, fontSize: 'clamp(30px, 3vw, 42px)', lineHeight: 1.1 }}>{title}</h2>
      </div>
      {children && <span style={{ fontSize: 16, color: C.sub, maxWidth: 420, lineHeight: 1.5 }}>{children}</span>}
    </div>
  );
}

export function Curriculum({ game: { s, actions } }: { game: Game }) {
  return (
    <section className="ss-section" aria-label="Levels">
      <SectionHead kicker="WHAT YOU'LL PRACTICE" title="6 levels, 3 rounds each">Every level mixes real messages with fakes, so you learn to tell them apart, not just to distrust everything.</SectionHead>
      <div className="ss-tiles">
        {LEVELS.map(([title, skill], li) => {
          const n = li + 1, idxs = roundsInLevel(n), b = badgeView(s, li), doneN = idxs.filter(i => isDone(s, i)).length;
          return (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#fff', borderRadius: 22, boxShadow: SHADOW, padding: '16px 18px' }}>
              <Medallion b={b} size={52} core={32} icon={18} />
              <div style={col(3, { flex: 1, minWidth: 0 })}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: C.faint }}>LEVEL {n}</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{title}</span>
                <span style={{ fontSize: 14, color: C.sub }}>{skill} · {doneN === idxs.length ? 'Done' : `${doneN} of ${idxs.length}`}</span>
              </div>
              <a href="#ss-game" onClick={() => actions.playLevel(n)} className="ss-outline" aria-label={`Play level ${n}: ${title}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '0 14px', borderRadius: 999, border: `1.5px solid ${C.outline}`, color: C.text, textDecoration: 'none', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                <Icon name="Play" size={16} />Play
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Calm on purpose: someone reading this may be mid-scam. No motion.
const HELP_STEPS = [
  { n: 1, title: 'Stop talking to them', body: "Hang up or close the message. It's okay to be rude." },
  { n: 2, title: "Don't send anything else", body: 'No money, gift cards, codes, or passwords.' },
  { n: 3, title: 'Call your bank yourself', body: 'Use the number on the back of your card, then report it.' },
];

export function HelpSection() {
  return (
    <section id="help" className="ss-section" aria-labelledby="ss-help-title" style={{ scrollMarginTop: 24 }}>
      <div style={col(6)}>
        <span style={kick('#96600f')}>REAL HELP · NOT PART OF THE GAME</span>
        <h2 id="ss-help-title" style={{ ...SERIF, margin: 0, fontSize: 'clamp(30px, 3vw, 42px)', lineHeight: 1.1 }}>Think you've been scammed?</h2>
      </div>
      <div className="ss-steps">
        {HELP_STEPS.map(hs => (
          <div key={hs.n} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 22, boxShadow: SHADOW, padding: '18px 20px' }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#ebf2ff', color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, flexShrink: 0 }}>{hs.n}</span>
            <div style={col(4)}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{hs.title}</span>
              <span style={{ fontSize: 15, lineHeight: 1.5, color: C.sub }}>{hs.body}</span>
            </div>
          </div>
        ))}
      </div>
      <span style={{ fontSize: 15, color: C.sub }}>
        Lost money or shared details? <a href="https://www.ic3.gov" target="_blank" rel="noreferrer">Report it to the FBI at ic3.gov</a>, and contact your bank right away.
      </span>
    </section>
  );
}

export function CtaBand() {
  return (
    <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, borderRadius: 28, color: '#fff', padding: 'clamp(24px, 3vw, 44px)', background: 'linear-gradient(120deg,#1a2f78 0%,#162563 60%,#101c4c 100%)' }}>
      <div style={col(8, { maxWidth: 620 })}>
        <span style={{ alignSelf: 'flex-start', ...kick('#cfdcff'), background: 'rgba(255,255,255,0.1)', borderRadius: 999, padding: '4px 12px' }}>AURA PROTECTION</span>
        <h2 style={{ ...SERIF, margin: 0, fontSize: 'clamp(28px, 2.6vw, 38px)', lineHeight: 1.12 }}>Let Aura catch the scams you miss</h2>
        <span style={{ fontSize: 16, lineHeight: 1.5, color: '#cfdcff' }}>Practice builds instincts. Aura adds all-in-one protection for your identity, finances and devices, so one slip doesn't cost you.</span>
      </div>
      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <a className="ss-btn" href={AURA} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 52, padding: '0 24px', borderRadius: 999, background: C.blue, color: '#fff', fontSize: 17, fontWeight: 600, textDecoration: 'none' }}>
          Start free trial<Icon name="ArrowRight" size={16} />
        </a>
        <a className="ss-ghost" href={AURA} style={{ ...ghost, minHeight: 52, padding: '0 22px', fontSize: 17 }}>Explore Aura</a>
      </span>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="ss-wrap" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBlock: '32px 40px', color: C.faint, fontSize: 13 }}>
      <Wordmark color={C.ink} height={18} />
      <span style={{ maxWidth: 760, lineHeight: 1.5 }}>Scam Spotter is a free practice tool. Every message in it is pretend, and brand names are used for education only. Statistics: FBI IC3 2024 Internet Crime Report.</span>
    </footer>
  );
}
