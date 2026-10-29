import { BADGES, KINDS, LEVELS, ROUNDS } from '../data/content';
import { Icon } from '../ds/Icon';
import { badgeView, isDone, levelSize, nextIdx, roundNumber, roundsInLevel, type Game } from '../game/useGame';
import { C, HERO, Medallion, SHADOW, col } from '../ui';

export function Home({ game: { s, actions } }: { game: Game }) {
  const nIdx = nextIdx(s), allDone = nIdx >= ROUNDS.length;
  const nr = ROUNDS[Math.min(nIdx, ROUNDS.length - 1)];
  const curLvl = allDone ? 6 : nr.lvl;
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

      {/* Jump straight to any level: tapping one starts its first unfinished round. */}
      <div style={col(4, { background: '#fff', borderRadius: 28, boxShadow: SHADOW, padding: '18px 12px 10px' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '0 8px 6px' }}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>Pick a level</span>
          <button onClick={() => actions.go('map')} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', fontSize: 16, fontWeight: 500, color: C.blue, cursor: 'pointer', minHeight: 44 }}>Trail<Icon name="ChevronRight" size={12} /></button>
        </div>
        {LEVELS.map(([title, skill], li) => {
          const lvl = li + 1, idxs = roundsInLevel(lvl), doneN = idxs.filter(i => isDone(s, i)).length;
          const current = !allDone && lvl === curLvl, icon = KINDS[ROUNDS[idxs[0]].kind][1];
          return (
            <button key={lvl} onClick={() => actions.playLevel(lvl)} aria-label={`Play level ${lvl}: ${title}`} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 18, border: 'none', cursor: 'pointer', textAlign: 'left', color: C.ink,
              background: current ? '#ebf2ff' : 'transparent', minHeight: 64,
            }}>
              <span style={{ width: 44, height: 44, borderRadius: '50%', background: current ? C.blue : '#ebf2ff', color: current ? '#fff' : C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={20} /></span>
              <span style={col(2, { flex: 1, minWidth: 0 })}>
                <span style={{ fontSize: 17, fontWeight: 600 }}>{lvl}. {title}</span>
                <span style={{ fontSize: 14, color: C.muted }}>{skill}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {doneN === idxs.length
                  ? <span style={{ width: 24, height: 24, borderRadius: '50%', background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="Checkmark" size={14} /></span>
                  : idxs.map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: isDone(s, i) ? C.teal : '#dde5ef' }} />)}
              </span>
              <Icon name="ChevronRight" size={14} style={{ color: C.faint }} />
            </button>
          );
        })}
      </div>

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
      <span style={{ fontSize: 12, color: C.faint, textAlign: 'center' }}>Version {__BUILD__}</span>
    </div>
  );
}
