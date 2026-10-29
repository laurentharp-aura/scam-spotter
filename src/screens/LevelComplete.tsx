import { LEVELS, ROUNDS } from '../data/content';
import { badgeView, levelSize, type Game } from '../game/useGame';
import { C, DISPLAY, Glow, Medallion, Pill, PrimaryButton, TextButton, col } from '../ui';

export function LevelComplete({ game: { s, actions } }: { game: Game }) {
  const dl = s.doneLevel, champ = dl === 6, b = badgeView(s, dl - 1);
  const primary = () => (champ ? actions.go('map') : actions.start(ROUNDS.findIndex(rd => rd.lvl === dl + 1)));
  const line = { fontSize: 18, lineHeight: 1.5, color: C.sub } as const;
  return (
    <div data-screen-label="06 Level complete" className="ss-narrow" style={{ paddingBlock: '24px 48px' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, background: C.hero, border: `1px solid ${C.hair}` }}>
        <Glow at="top" />
        <div style={col(18, { position: 'relative', alignItems: 'center', textAlign: 'center', padding: '56px 28px 32px' })}>
          <div style={{ animation: 'ss-pop .5s ease-out both', filter: 'drop-shadow(0 12px 32px rgba(25,47,112,0.18))' }}><Medallion b={b} size={168} core={104} icon={60} /></div>
          <Pill good>Badge earned · {b.name}</Pill>
          <h1 style={{ ...DISPLAY, margin: 0, fontSize: 40, lineHeight: 1.05, textWrap: 'balance' }}>{LEVELS[dl - 1][2]}</h1>
          <span style={line}>All {levelSize(dl)} rounds complete.{' '}{champ ? "You've earned all 6 badges." : `Next up: ${LEVELS[dl][0]} — ${LEVELS[dl][1].toLowerCase()}.`}</span>
          <div style={col(8, { width: '100%', maxWidth: 360, marginTop: 12 })}>
            <PrimaryButton size={19} onClick={primary}>{champ ? 'Back to the trail' : `Start Level ${dl + 1}`}</PrimaryButton>
            <TextButton onClick={() => actions.go('home')}>Back to home</TextButton>
          </div>
        </div>
      </div>
    </div>
  );
}
