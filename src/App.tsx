import { Icon } from './ds/Icon';
import { settings } from './game/settings';
import { useGame, type Game, type Screen } from './game/useGame';
import { C, FONT } from './ui';
import { HowToPlay, NameScreen, Welcome } from './screens/Onboarding';
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
  const backTo: Partial<Record<Screen, Screen>> = { help: s.prev || 'home', name: 'welcome', how: 'name' };
  const pill = { height: 48, borderRadius: 999, border: `1.5px solid ${bd}`, background: 'transparent', fontWeight: 600, color: fg, cursor: 'pointer' } as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', position: 'sticky', top: 'env(safe-area-inset-top, 0px)', zIndex: 5, background: C.page, minHeight: 72 }}>
      {s.screen === 'home' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={`${import.meta.env.BASE_URL}images/aura-app-icon.png`} alt="" width={42} height={42} style={{ display: 'block' }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 3, lineHeight: 1.1 }}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>Scam Spotter</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.faint }}>by <img src={`${import.meta.env.BASE_URL}images/aura-logo.svg`} alt="Aura" height={10} style={{ display: 'block', opacity: 0.7 }} /></span>
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
