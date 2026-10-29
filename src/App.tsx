import { Icon } from './ds/Icon';
import { settings } from './game/settings';
import { useGame, type Game, type Screen } from './game/useGame';
import { C, FONT } from './ui';
import { HowToPlay, NameScreen, Welcome, WhyItMatters } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Trail } from './screens/Trail';
import { RoundScreen } from './screens/Round';
import { LevelComplete } from './screens/LevelComplete';
import { Badges } from './screens/Badges';
import { Help } from './screens/Help';

export default function App() {
  const game = useGame();
  const { s } = game;

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: C.page, fontFamily: FONT,
      color: C.ink, position: 'relative', letterSpacing: '-0.01em', boxShadow: '0 20px 60px rgba(12,19,28,0.12)',
    }}>
      <div style={{ zoom: settings.textScale }}>
        <TopBar game={game} />
        {s.screen === 'welcome' && <Welcome game={game} />}
        {s.screen === 'why' && <WhyItMatters game={game} />}
        {s.screen === 'name' && <NameScreen game={game} />}
        {s.screen === 'how' && <HowToPlay game={game} />}
        {s.screen === 'home' && <Home game={game} />}
        {s.screen === 'map' && <Trail game={game} />}
        {s.screen === 'round' && <RoundScreen game={game} />}
        {s.screen === 'complete' && <LevelComplete game={game} />}
        {s.screen === 'guide' && <Badges game={game} />}
        {s.screen === 'help' && <Help />}
      </div>
    </div>
  );
}

function TopBar({ game: { s, actions } }: { game: Game }) {
  const fg = C.ink, bd = C.border;
  const backTo: Partial<Record<Screen, Screen>> = { help: s.prev || 'home', why: 'welcome', name: 'why', how: 'name' };
  const pill = { height: 48, borderRadius: 999, border: `1.5px solid ${bd}`, background: 'transparent', fontWeight: 600, color: fg, cursor: 'pointer' } as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', position: 'sticky', top: 'env(safe-area-inset-top, 0px)', zIndex: 5, background: C.page, minHeight: 72 }}>
      {s.screen === 'home' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="Shield" size={22} /></div>
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>Scam Spotter</span>
            <span style={{ fontSize: 13, color: C.faint }}>by Aura</span>
          </span>
        </div>
      )}
      {s.screen !== 'home' && s.screen !== 'welcome' && (
        <button onClick={() => actions.go(backTo[s.screen] || 'home')} style={{ ...pill, padding: '0 18px 0 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 17 }}>
          <Icon name="ChevronLeft" size={22} />{s.screen === 'round' ? 'Quit' : 'Back'}
        </button>
      )}
      {s.screen === 'welcome' && <span />}
      <button onClick={() => actions.go('help')} style={{ ...pill, padding: '0 16px', fontSize: 16 }}>Need help?</button>
    </div>
  );
}
