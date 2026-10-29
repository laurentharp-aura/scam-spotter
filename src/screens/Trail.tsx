import { LEVELS } from '../data/content';
import { Icon } from '../ds/Icon';
import { badgeView, isDone, nextIdx, playable, roundsInLevel, type Game } from '../game/useGame';
import { C, DISPLAY, Medallion, col } from '../ui';

export function Trail({ game: { s, actions } }: { game: Game }) {
  const nIdx = nextIdx(s);
  return (
    <div data-screen-label="02 Level map" style={col(24, { paddingBlock: '24px 48px' })}>
      <h1 style={{ ...DISPLAY, margin: 0, fontSize: 'clamp(36px, 4.4vw, 52px)' }}>The trail</h1>
      <div className="ss-trail">
        {LEVELS.map(([title, skill], li) => {
          const lvl = li + 1, idxs = roundsInLevel(lvl), b = badgeView(s, li);
          const doneAll = idxs.every(i => isDone(s, i)), current = !doneAll && idxs.some(i => playable(s, i)), locked = !doneAll && !current;
          return (
            <div key={lvl} style={col(16, {
              borderRadius: 28, padding: 22, opacity: locked ? 0.55 : 1,
              background: current ? `linear-gradient(${C.surface},${C.surface}) padding-box,linear-gradient(90deg,#6121FF,#2A5FFC) border-box` : doneAll ? 'rgba(37,218,167,0.10)' : C.surface,
              border: `1.5px ${locked ? 'dashed' : 'solid'} ${current ? 'transparent' : doneAll ? 'rgba(37,218,167,0.35)' : C.hair}`,
            })}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Medallion b={b} size={52} core={32} icon={18} />
                <div style={col(2)}>
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: C.faint }}>LEVEL {lvl}</span>
                  <span style={{ ...DISPLAY, fontSize: 26, lineHeight: 1.05 }}>{title}</span>
                  <span style={{ fontSize: 15, color: C.sub }}>{skill}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {idxs.map((i, k) => {
                  const dn = isDone(s, i), pl = playable(s, i), isNext = i === nIdx;
                  return (
                    <button key={i} className={pl ? 'ss-lift' : undefined} onClick={() => pl && actions.start(i)} disabled={!pl} aria-label={`Level ${lvl} round ${k + 1}`} style={{
                      width: 52, height: 52, borderRadius: '50%', border: `1.5px ${pl ? 'solid' : 'dashed'} ${dn || isNext ? 'transparent' : C.locked}`,
                      background: dn ? C.teal : isNext ? C.blue : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: pl ? 'pointer' : 'default', color: isNext && !dn ? '#fff' : C.ink, fontSize: 19, fontWeight: 600,
                      boxShadow: isNext ? '0 0 0 6px rgba(42,95,252,0.25)' : 'none',
                    }}>
                      {dn ? <Icon name="Checkmark" size={22} /> : <span>{k + 1}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <button className="ss-outline" onClick={actions.resetAll} style={{ alignSelf: 'center', minHeight: 48, padding: '0 24px', border: '1.5px dashed #a3aebf', borderRadius: 999, background: 'none', fontSize: 16, fontWeight: 600, color: C.sub, cursor: 'pointer' }}>Start over as a new player</button>
    </div>
  );
}
