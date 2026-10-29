import { KINDS, LEVELS, ROUNDS } from '../data/content';
import { Icon } from '../ds/Icon';
import { badgeView, isDone, levelSize, nextIdx, roundNumber, roundsInLevel, type Game } from '../game/useGame';
import { StatsBand } from './StatsBand';
import { C, DISPLAY, Glow, Medallion, SHADOW, col } from '../ui';

export function Home({ game: { s, actions } }: { game: Game }) {
  const nIdx = nextIdx(s), allDone = nIdx >= ROUNDS.length;
  const nr = ROUNDS[Math.min(nIdx, ROUNDS.length - 1)];
  const isNew = Object.keys(s.done).length === 0;
  const hr = new Date().getHours();
  const greet = `Good ${hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening'}${s.name ? ', ' + s.name : ''}.`;
  const sub = allDone ? "You've completed every level." : isNew ? 'Your first practice round is ready.' : 'Pick up where you left off, or jump to any level.';
  const linkBtn = { border: 'none', background: 'none', padding: 0, fontSize: 15, fontWeight: 600, color: C.link, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 } as const;

  return (
    <div data-screen-label="01 Home" className="ss-home" style={{ paddingBlock: '20px 32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 14px' }}>
        <h1 style={{ ...DISPLAY, margin: 0, fontSize: 'clamp(28px, 2.6vw, 38px)', lineHeight: 1.1 }}>{greet}</h1>
        <span style={{ fontSize: 18, color: C.sub }}>{sub}</span>
      </div>

      {/* Next round */}
      <div style={{ position: 'relative', overflow: 'hidden', background: C.hero, border: `1px solid ${C.hair}`, borderRadius: 28, boxShadow: SHADOW, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Glow />
        <div style={col(14, { position: 'relative', padding: 'clamp(24px, 2.4vw, 36px)' })}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: C.sky }}>{allDone ? 'ALL ROUNDS COMPLETE' : isNew ? 'GET STARTED' : 'YOUR NEXT ROUND'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {!allDone && <span style={{ width: 48, height: 48, borderRadius: '50%', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={KINDS[nr.kind][1]} size={22} /></span>}
            <div style={col(4)}>
              <span style={{ ...DISPLAY, fontSize: 'clamp(26px, 2.4vw, 36px)', lineHeight: 1.06 }}>{allDone ? 'Replay any level' : isNew ? "Let's start with a practice text" : LEVELS[nr.lvl - 1][3]}</span>
              {!allDone && <span style={{ fontSize: 15, color: C.sub }}>Level {nr.lvl} · Round {roundNumber(nIdx)} of {levelSize(nr.lvl)}</span>}
            </div>
          </div>
          <button className="ss-press ss-btn" onClick={actions.playNext} style={{ marginTop: 6, minHeight: 54, maxWidth: 280, borderRadius: 999, border: 'none', background: C.blue, color: '#fff', fontSize: 18, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Icon name="Play" size={20} />{allDone ? 'Open the trail' : isNew ? 'Start playing' : 'Start round'}
          </button>
        </div>
      </div>

      {/* Level picker: jump straight to any level. Each tile carries its badge. */}
      <div style={col(14, { background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 28, boxShadow: SHADOW, padding: 'clamp(20px, 2vw, 28px)' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <span style={{ ...DISPLAY, fontSize: 24 }}>Pick a level</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <button className="ss-link" onClick={() => actions.go('guide')} style={linkBtn}>Badges</button>
            <button className="ss-link" onClick={() => actions.go('map')} style={linkBtn}>Trail<Icon name="ChevronRight" size={12} /></button>
          </span>
        </div>
        <div className="ss-levels">
          {LEVELS.map(([title], li) => {
            const lvl = li + 1, idxs = roundsInLevel(lvl), done = idxs.filter(i => isDone(s, i)).length, b = badgeView(s, li);
            const current = !allDone && nr.lvl === lvl;
            return (
              <button key={lvl} className="ss-lift" onClick={() => actions.playLevel(lvl)} aria-label={`Play level ${lvl}: ${title}`} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 20, cursor: 'pointer', textAlign: 'left', color: C.text,
                background: current ? '#ebf2ff' : C.bg, border: `1.5px solid ${current ? C.blue : 'transparent'}`,
              }}>
                <Medallion b={b} size={44} core={28} icon={16} />
                <span style={col(3, { flex: 1, minWidth: 0 })}>
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: C.faint }}>LEVEL {lvl}</span>
                  <span style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.15 }}>{title}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {idxs.map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: isDone(s, i) ? C.teal : C.locked }} />)}
                    <span style={{ fontSize: 13, color: C.faint, marginLeft: 4 }}>{done === idxs.length ? 'Done' : `${done} of ${idxs.length}`}</span>
                  </span>
                </span>
                <Icon name="Play" size={18} style={{ color: C.blue, flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="ss-span"><StatsBand /></div>
    </div>
  );
}
