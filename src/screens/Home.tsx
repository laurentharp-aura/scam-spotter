import { BADGES, LEVELS, ROUNDS } from '../data/content';
import { Icon } from '../ds/Icon';
import { badgeView, isDone, levelSize, nextIdx, roundNumber, roundsInLevel, type Game } from '../game/useGame';
import { StatsBand } from './StatsBand';
import { C, HERO, Medallion, SHADOW, col } from '../ui';

export function Home({ game: { s, actions } }: { game: Game }) {
  const nIdx = nextIdx(s), allDone = nIdx >= ROUNDS.length;
  const nr = ROUNDS[Math.min(nIdx, ROUNDS.length - 1)];
  const curLvl = allDone ? 6 : nr.lvl;
  const lvlRounds = roundsInLevel(curLvl), lvlDone = lvlRounds.filter(i => isDone(s, i)).length;
  const isNew = Object.keys(s.done).length === 0;
  const hr = new Date().getHours();
  const greet = `Good ${hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening'}${s.name ? ', ' + s.name : ''}.`;
  const sub = allDone ? "You've completed every level." : isNew ? 'Your first practice round is ready.' : 'Pick up where you left off.';
  const badges = BADGES.map((_, li) => badgeView(s, li));

  return (
    <div data-screen-label="01 Home" style={col(24, { padding: '8px 20px 40px' })}>
      <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.2 }}>{greet}<br />{sub}</span>

      <div style={col(14, { background: HERO, color: '#fff', borderRadius: 28, boxShadow: SHADOW, padding: 24 })}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', color: '#B79CFF' }}>{allDone ? 'ALL ROUNDS COMPLETE' : isNew ? 'GET STARTED' : 'YOUR NEXT ROUND'}</span>
        <span style={col(4)}>
          <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1 }}>{allDone ? 'Replay any round from the trail' : isNew ? "Let's start with a practice text" : LEVELS[nr.lvl - 1][3]}</span>
          {!allDone && <span style={{ fontSize: 15, color: '#cfe0ff' }}>Level {nr.lvl} · Round {roundNumber(nIdx)} of {levelSize(nr.lvl)}</span>}
        </span>
        <button className="ss-press" onClick={actions.playNext} style={{ marginTop: 4, minHeight: 60, borderRadius: 999, border: 'none', background: '#fff', color: C.navy, fontSize: 20, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Icon name="Play" size={22} />{allDone ? 'Open the trail' : isNew ? 'Start playing' : 'Start round'}
        </button>
      </div>

      <button onClick={() => actions.go('map')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', color: C.ink, textAlign: 'left', minHeight: 48 }}>
        <span style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>{allDone ? 'Champion · all 6 levels' : `Level ${curLvl} · ${LEVELS[curLvl - 1][0]}`}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {lvlRounds.map((_, k) => <span key={k} style={{ width: 14, height: 14, borderRadius: '50%', background: allDone || k < lvlDone ? C.teal : '#dde5ef' }} />)}
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.blue }}>Trail</span>
        <Icon name="ChevronRight" size={14} style={{ color: C.blue }} />
      </button>

      <div style={col(16, { background: 'linear-gradient(#fff,#fff) padding-box,linear-gradient(90deg,#6121FF,#2A5FFC) border-box', border: '1.5px solid transparent', borderRadius: 28, boxShadow: SHADOW, padding: 20 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={col(2)}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>Your badges</span>
            <span style={{ fontSize: 15, color: C.muted }}>Finish a level to earn its badge · {badges.filter(b => b.earned).length} of 6</span>
          </div>
          <button onClick={() => actions.go('guide')} style={{ border: 'none', background: 'none', fontSize: 16, fontWeight: 500, color: C.blue, cursor: 'pointer', minHeight: 44 }}>See all</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px 8px' }}>
          {badges.map((b, li) => (
            <button key={b.name} onClick={() => actions.openBadge(li)} style={{ border: 'none', background: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', color: C.ink, opacity: b.op }}>
              <Medallion b={b} size={64} core={40} icon={24} />
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2, textAlign: 'center' }}>{b.name}</span>
            </button>
          ))}
        </div>
      </div>
      <StatsBand />
    </div>
  );
}
