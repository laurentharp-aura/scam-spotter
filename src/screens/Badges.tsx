import { BADGES, LEVELS } from '../data/content';
import { badgeView, type Game } from '../game/useGame';
import { C, DISPLAY, Glow, Medallion, col } from '../ui';

export function Badges({ game: { s, actions } }: { game: Game }) {
  const badges = BADGES.map((_, li) => badgeView(s, li));
  const ob = s.openB != null ? badges[s.openB] : null;
  return (
    <div data-screen-label="Badges" className="ss-narrow ss-narrow-wide" style={col(20, { paddingBlock: '24px 48px' })}>
      <div style={col(6)}>
        <h1 style={{ ...DISPLAY, margin: 0, fontSize: 'clamp(36px, 4.4vw, 52px)' }}>Your badges</h1>
        <span style={{ fontSize: 17, color: C.sub }}>Each level teaches one habit. Finish every round in a level to earn its badge.</span>
      </div>
      {ob && s.openB != null && (
        <div style={{ position: 'relative', overflow: 'hidden', background: C.hero, border: `1px solid ${C.hair}`, borderRadius: 32, animation: 'ss-rise .25s ease-out' }}>
          {ob.earned && <Glow />}
          <div style={col(12, { position: 'relative', padding: '32px 22px', alignItems: 'center', textAlign: 'center' })}>
            <Medallion b={ob} size={120} core={74} icon={44} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: ob.earned ? '#ebfaf6' : C.surface2, color: ob.earned ? '#22705a' : C.sub, fontSize: 14, fontWeight: 600, marginTop: 6 }}>
              {ob.earned ? 'Earned' : 'Locked'}
            </span>
            <span style={{ ...DISPLAY, fontSize: 32, lineHeight: 1.1 }}>{ob.name}</span>
            <span style={{ fontSize: 18, lineHeight: 1.45, color: C.sub, textWrap: 'pretty' }}>
              {ob.earned ? LEVELS[s.openB][2] : `Finish Level ${s.openB + 1} · ${LEVELS[s.openB][0]} to earn it.`}
            </span>
            {!ob.earned && (
              <button className="ss-btn" onClick={actions.playNext} style={{ marginTop: 6, minHeight: 54, padding: '0 24px', borderRadius: 999, border: 'none', background: C.blue, color: '#fff', fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>Play your next round</button>
            )}
          </div>
        </div>
      )}
      <div className="ss-badge-grid">
        {badges.map((b, li) => (
          <button key={b.name} className="ss-lift" onClick={() => actions.openBadge(li)} style={{ background: C.surface, border: `1.5px solid ${s.openB === li ? C.link : C.hair}`, borderRadius: 24, padding: '22px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', color: b.earned ? C.text : C.faint, textAlign: 'center' }}>
            <Medallion b={b} size={76} core={47} icon={28} />
            <span style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>{b.name}</span>
            <span style={{ fontSize: 14, color: C.faint }}>{b.earned ? 'Earned' : `Level ${li + 1} · ${LEVELS[li][0]}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
