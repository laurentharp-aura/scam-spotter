import { BADGES, KINDS, LEVELS, ROUNDS } from '../data/content';
import { Icon } from '../ds/Icon';
import { badgeView, isDone, levelSize, nextIdx, roundNumber, roundsInLevel, type Game } from '../game/useGame';
import { C, DISPLAY, Glow, Medallion, PASTEL, col } from '../ui';

export function Home({ game: { s, actions } }: { game: Game }) {
  const nIdx = nextIdx(s), allDone = nIdx >= ROUNDS.length;
  const nr = ROUNDS[Math.min(nIdx, ROUNDS.length - 1)];
  const curLvl = allDone ? 6 : nr.lvl;
  const lvlRounds = roundsInLevel(curLvl);
  const lvlDone = lvlRounds.filter(i => isDone(s, i)).length;
  const isNew = Object.keys(s.done).length === 0;
  const hr = new Date().getHours();
  const greet = `Good ${hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening'}${s.name ? ', ' + s.name : ''}.`;
  const sub = allDone ? "You've completed every level." : isNew ? 'Your first practice round is ready.' : 'Pick up where you left off.';
  const badges = BADGES.map((_, li) => badgeView(s, li));

  return (
    <div data-screen-label="01 Home" className="ss-home" style={{ paddingBlock: '24px 48px' }}>
      <h1 style={{ ...DISPLAY, margin: 0, fontSize: 'clamp(34px, 4.4vw, 52px)', lineHeight: 1.05, textWrap: 'balance' }}>
        {greet}<br /><span style={{ color: C.sub }}>{sub}</span>
      </h1>

      <div style={col(16)}>
        <div style={{ position: 'relative', overflow: 'hidden', background: '#0a0a0b', border: `1px solid ${C.hair}`, borderRadius: 32, minHeight: 300 }}>
          <Glow />
          <div style={col(16, { position: 'relative', padding: 32 })}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', color: C.peach }}>{allDone ? 'ALL ROUNDS COMPLETE' : isNew ? 'GET STARTED' : 'YOUR NEXT ROUND'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {!allDone && <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={KINDS[nr.kind][1]} size={26} /></span>}
              <div style={col(4)}>
                <span style={{ ...DISPLAY, fontSize: 32, lineHeight: 1.08 }}>{allDone ? 'Replay any round from the trail' : isNew ? "Let's start with a practice text" : LEVELS[nr.lvl - 1][3]}</span>
                {!allDone && <span style={{ fontSize: 15, color: C.sub }}>Level {nr.lvl} · Round {roundNumber(nIdx)} of {levelSize(nr.lvl)}</span>}
              </div>
            </div>
            <button className="ss-press ss-btn" onClick={actions.playNext} style={{ marginTop: 12, minHeight: 58, maxWidth: 300, borderRadius: 999, border: 'none', background: C.blue, color: '#fff', fontSize: 19, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Icon name="Play" size={22} />{allDone ? 'Open the trail' : isNew ? 'Start playing' : 'Start round'}
            </button>
          </div>
        </div>

        <button className="ss-lift" onClick={() => actions.go('map')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: PASTEL, border: 'none', borderRadius: 24, padding: '16px 22px', cursor: 'pointer', color: C.ink, textAlign: 'left', minHeight: 72 }}>
          <div style={col(2, { flex: 1 })}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: C.body }}>{allDone ? 'CHAMPION' : `LEVEL ${curLvl}`}</span>
            <span style={{ ...DISPLAY, fontSize: 22 }}>{allDone ? 'All 6 levels done' : LEVELS[curLvl - 1][0]}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {lvlRounds.map((_, k) => <span key={k} style={{ width: 14, height: 14, borderRadius: '50%', background: allDone || k < lvlDone ? C.ink : 'rgba(11,19,43,0.18)' }} />)}
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 8 }}>Trail</span>
          <Icon name="ChevronRight" size={14} />
        </button>
      </div>

      <div style={col(18, { background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 32, padding: 26 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={col(2)}>
            <span style={{ ...DISPLAY, fontSize: 24 }}>Your badges</span>
            <span style={{ fontSize: 15, color: C.sub }}>Finish a level to earn its badge · {badges.filter(b => b.earned).length} of 6</span>
          </div>
          <button className="ss-outline" onClick={() => actions.go('guide')} style={{ border: '1.5px solid rgba(255,255,255,0.55)', borderRadius: 999, background: 'none', padding: '0 16px', fontSize: 15, fontWeight: 600, color: C.text, cursor: 'pointer', minHeight: 40, whiteSpace: 'nowrap' }}>See all</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px 8px' }}>
          {badges.map((b, li) => (
            <button key={b.name} className="ss-lift" onClick={() => actions.openBadge(li)} style={{ border: 'none', background: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', color: b.earned ? C.text : C.faint }}>
              <Medallion b={b} size={64} core={40} icon={24} />
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2, textAlign: 'center' }}>{b.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
