import { LEVELS, ROUNDS } from '../data/content';
import { badgeView, levelSize, type Game } from '../game/useGame';
import { C, Medallion, Pill, PrimaryButton, TextButton, col } from '../ui';

export function LevelComplete({ game: { s, actions } }: { game: Game }) {
  const dl = s.doneLevel, champ = dl === 6, b = badgeView(s, dl - 1);
  const primary = () => (champ ? actions.go('map') : actions.start(ROUNDS.findIndex(rd => rd.lvl === dl + 1)));
  const line = { fontSize: 18, lineHeight: 1.5, color: C.body } as const;
  return (
    <div data-screen-label="06 Level complete" className="ss-narrow ss-fill" style={col(18, { alignItems: 'center', textAlign: 'center', paddingBlock: '12px 48px' })}>
      <div style={{ marginTop: 20, animation: 'ss-pop .5s ease-out both' }}><Medallion b={b} size={168} core={104} icon={60} /></div>
      <Pill bg="#ebfaf6" fg="#22705a" dot={C.teal}>Badge earned · {b.name}</Pill>
      <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.1, textWrap: 'balance' }}>{LEVELS[dl - 1][2]}</span>
      <span style={line}>All {levelSize(dl)} rounds complete.</span>
      <span style={line}>{champ ? "You've earned all 6 badges." : `Next up: ${LEVELS[dl][0]} — ${LEVELS[dl][1].toLowerCase()}.`}</span>
      <div style={col(10, { width: '100%', marginTop: 'auto' })}>
        <PrimaryButton size={19} onClick={primary}>{champ ? 'Back to the trail' : `Start Level ${dl + 1}`}</PrimaryButton>
        <TextButton onClick={() => actions.go('home')}>Back to home</TextButton>
      </div>
    </div>
  );
}
