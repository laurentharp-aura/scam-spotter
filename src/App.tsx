import { Icon } from './ds/Icon';
import { settings } from './game/settings';
import { useGame, type Game, type Screen } from './game/useGame';
import { C } from './ui';
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
      minHeight: '100vh', background: C.page, fontFamily: "'Inter',system-ui,sans-serif",
      color: C.ink, letterSpacing: '-0.01em',
    }}>
      <div style={{ zoom: settings.textScale }}>
        <TopBar game={game} />
        <main className="ss-wrap">
          {s.screen === 'welcome' && <Welcome game={game} />}
          {s.screen === 'name' && <NameScreen game={game} />}
          {s.screen === 'how' && <HowToPlay game={game} />}
          {s.screen === 'home' && <Home game={game} />}
          {s.screen === 'map' && <Trail game={game} />}
          {s.screen === 'round' && <RoundScreen game={game} />}
          {s.screen === 'complete' && <LevelComplete game={game} />}
          {s.screen === 'guide' && <Badges game={game} />}
          {s.screen === 'help' && <Help />}
        </main>
      </div>
    </div>
  );
}

function TopBar({ game: { s, actions } }: { game: Game }) {
  const fg = C.ink, bd = C.border;
  const backTo: Partial<Record<Screen, Screen>> = { help: s.prev || 'home', name: 'welcome', how: 'name' };
  const pill = { height: 48, borderRadius: 999, border: `1.5px solid ${bd}`, background: 'transparent', fontWeight: 600, color: fg, cursor: 'pointer' } as const;
  const onboarding = ['welcome', 'name', 'how'].includes(s.screen);
  const brand = (
    <>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="Shield" size={22} /></div>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, textAlign: 'left' }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: fg }}>Scam Spotter</span>
        <span style={{ fontSize: 13, color: C.faint }}>by Aura</span>
      </span>
    </>
  );
  const brandBox = { display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0 } as const;
  return (
    <header style={{ position: 'sticky', top: 'env(safe-area-inset-top, 0px)', zIndex: 5, background: C.page, borderBottom: '1px solid #dde5ef' }}>
      <div className="ss-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingBlock: 12, minHeight: 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Phones show the brand only on home; desktop always shows it, and it links home once onboarded. */}
          {onboarding || !s.onboarded
            ? <div className={s.screen === 'home' ? undefined : 'ss-desktop'} style={brandBox}>{brand}</div>
            : <button onClick={() => actions.go('home')} aria-label="Scam Spotter home" className={s.screen === 'home' ? undefined : 'ss-desktop'} style={{ ...brandBox, cursor: 'pointer' }}>{brand}</button>}
          {s.screen !== 'home' && s.screen !== 'welcome' && (
            <button onClick={() => actions.go(backTo[s.screen] || 'home')} style={{ ...pill, padding: '0 18px 0 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 17 }}>
              <Icon name="ChevronLeft" size={22} />{s.screen === 'round' ? 'Quit' : 'Back'}
            </button>
          )}
        </div>
        <button onClick={() => actions.go('help')} style={{ ...pill, padding: '0 16px', fontSize: 16 }}>Need help?</button>
      </div>
    </header>
  );
}
