import { BADGES, LEVELS } from '../data/content';
import { badgeView, type Game } from '../game/useGame';
import { C, HERO, Medallion, SHADOW, col } from '../ui';

export function Badges({ game: { s, actions } }: { game: Game }) {
  const badges = BADGES.map((_, li) => badgeView(s, li));
  const ob = s.openB != null ? badges[s.openB] : null;
  return (
    <div data-screen-label="Badges" style={col(18, { padding: '4px 20px 48px' })}>
      <div style={col(4)}>
        <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.2 }}>Your badges</span>
        <span style={{ fontSize: 17, color: C.muted }}>Each level teaches one habit. Finish all 3 rounds to earn its badge.</span>
      </div>
      {ob && s.openB != null && (
        <div style={col(12, { background: HERO, color: '#fff', borderRadius: 28, padding: '28px 22px', alignItems: 'center', textAlign: 'center', animation: 'ss-rise .25s ease-out' })}>
          <Medallion b={ob} size={120} core={74} icon={44} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: ob.earned ? 'rgba(37,218,167,0.18)' : 'rgba(255,255,255,0.12)', color: ob.earned ? '#97f0d7' : '#cfe0ff', fontSize: 14, fontWeight: 500, marginTop: 6 }}>
            {ob.earned ? 'Earned' : 'Locked'}
          </span>
          <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.15 }}>{ob.name}</span>
          <span style={{ fontSize: 18, lineHeight: 1.45, color: '#cfe0ff', textWrap: 'pretty' }}>
            {ob.earned ? LEVELS[s.openB][2] : `Finish Level ${s.openB + 1} · ${LEVELS[s.openB][0]} to earn it.`}
          </span>
          {!ob.earned && (
            <button onClick={actions.playNext} style={{ marginTop: 6, minHeight: 54, padding: '0 24px', borderRadius: 999, border: 'none', background: '#fff', color: C.navy, fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>Play your next round</button>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {badges.map((b, li) => (
          <button key={b.name} onClick={() => actions.openBadge(li)} style={{ background: '#fff', border: `2px solid ${s.openB === li ? C.blue : 'transparent'}`, borderRadius: 24, boxShadow: SHADOW, padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', color: C.ink, textAlign: 'center' }}>
            <div style={{ opacity: b.op }}><Medallion b={b} size={76} core={47} icon={28} /></div>
            <span style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>{b.name}</span>
            <span style={{ fontSize: 14, color: C.muted }}>{b.earned ? 'Earned' : `Level ${li + 1}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
