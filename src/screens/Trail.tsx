import { LEVELS } from '../data/content';
import { Icon } from '../ds/Icon';
import { badgeView, nextIdx, playable, roundsInLevel, type Game } from '../game/useGame';
import { C, Medallion, SHADOW, col } from '../ui';

export function Trail({ game: { s, actions } }: { game: Game }) {
  const nIdx = nextIdx(s);
  return (
    <div data-screen-label="02 Level map" style={col(6, { padding: '4px 20px 48px' })}>
      <span style={{ fontSize: 34, fontWeight: 600, marginBottom: 14 }}>The trail</span>
      {LEVELS.map(([title, skill], li) => {
        const lvl = li + 1, idxs = roundsInLevel(lvl);
        const doneAll = idxs.every(i => s.done[i]), current = !doneAll && idxs.some(i => playable(s, i)), locked = !doneAll && !current;
        const left = li % 2 === 0, path = `2px dashed ${C.border}`;
        return (
          <div key={lvl} style={{ display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'flex-end' }}>
            <div style={col(14, {
              width: '86%', borderRadius: 24, padding: 16, opacity: locked ? 0.55 : 1,
              background: doneAll ? '#ebfaf6' : current ? 'linear-gradient(#fff,#fff) padding-box,linear-gradient(90deg,#6121FF,#2A5FFC) border-box' : 'transparent',
              border: `2px ${locked ? 'dashed' : 'solid'} ${current ? 'transparent' : doneAll ? '#bbf2e2' : C.border}`,
              boxShadow: current ? SHADOW : 'none',
            })}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {(() => { const b = badgeView(s, li); return <div style={{ opacity: b.op }}><Medallion b={b} size={48} core={30} icon={18} /></div>; })()}
                <div style={col(2)}>
                  <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', color: C.body }}>LEVEL {lvl}</span>
                  <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1 }}>{title}</span>
                  <span style={{ fontSize: 16, color: C.body }}>{skill}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {idxs.map((i, k) => {
                  const dn = !!s.done[i], pl = playable(s, i), isNext = i === nIdx;
                  return (
                    <button key={i} onClick={() => pl && actions.start(i)} disabled={!pl} aria-label={`Level ${lvl} round ${k + 1}`} style={{
                      width: 52, height: 52, borderRadius: '50%', border: `1.5px ${pl ? 'solid' : 'dashed'} ${C.border}`,
                      background: dn ? C.teal : isNext ? C.blue : C.line, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: pl ? 'pointer' : 'default', color: isNext ? '#fff' : C.ink, fontSize: 19, fontWeight: 600, boxShadow: isNext ? SHADOW : 'none',
                    }}>
                      {dn ? <Icon name="Checkmark" size={22} /> : <span>{k + 1}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            {li < 5 && <div style={{ height: 28, width: '60%', borderLeft: left ? 'none' : path, borderRight: left ? path : 'none', margin: '0 auto' }} />}
          </div>
        );
      })}
      <button onClick={actions.resetAll} style={{ marginTop: 24, minHeight: 48, border: '2px dashed #a3aebf', borderRadius: 999, background: 'none', fontSize: 16, fontWeight: 600, color: C.muted, cursor: 'pointer' }}>Start over as a new player</button>
    </div>
  );
}
