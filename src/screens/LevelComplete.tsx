import { LEVELS } from '../data/content';
import { badgeView, levelSize, type Game } from '../game/useGame';
import { C, DISPLAY, Glow, Medallion, Pill, PrimaryButton, TextButton, col } from '../ui';

/** Shown inside the game card when the last round of a level is done. */
export function LevelComplete({ game: { s, actions } }: { game: Game }) {
  const dl = s.doneLevel, last = dl === LEVELS.length, b = badgeView(s, dl - 1);
  return (
    <div data-screen-label="Level complete" style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, background: C.hero, border: `1px solid ${C.hair}` }}>
      <Glow at="top" />
      <div style={col(16, { position: 'relative', alignItems: 'center', textAlign: 'center', padding: 'clamp(32px, 4vw, 56px) 24px' })}>
        <div style={{ animation: 'ss-pop .5s ease-out both', filter: 'drop-shadow(0 12px 32px rgba(25,47,112,0.18))' }}><Medallion b={b} size={140} core={86} icon={50} /></div>
        <Pill good>Badge earned · {b.name}</Pill>
        <h3 style={{ ...DISPLAY, margin: 0, fontSize: 'clamp(30px, 3vw, 40px)', lineHeight: 1.05, textWrap: 'balance' }}>{LEVELS[dl - 1][2]}</h3>
        <span style={{ fontSize: 18, lineHeight: 1.5, color: C.sub }}>
          All {levelSize(dl)} rounds complete.{' '}{last ? 'That was the final level.' : `Next up: ${LEVELS[dl][0]} — ${LEVELS[dl][1].toLowerCase()}.`}
        </span>
        <div style={col(6, { width: '100%', maxWidth: 340, marginTop: 6 })}>
          <PrimaryButton size={18} onClick={() => actions.playLevel(last ? 1 : dl + 1)} style={{ minHeight: 54 }}>{last ? 'Play again from Level 1' : `Start Level ${dl + 1}`}</PrimaryButton>
          <TextButton onClick={() => actions.playLevel(dl)}>Replay this level</TextButton>
        </div>
      </div>
    </div>
  );
}
