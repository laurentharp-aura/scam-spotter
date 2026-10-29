import { settings } from './game/settings';
import { useGame } from './game/useGame';
import { CtaBand, Curriculum, Footer, GameCard, HelpSection, Hero } from './screens/Site';
import { StatsBand } from './screens/StatsBand';

/** One aura.com-style page: hero, the game card, then the supporting sections. */
export default function App() {
  const game = useGame();
  return (
    <div style={{ zoom: settings.textScale, fontFamily: "'Inter',system-ui,sans-serif", letterSpacing: '-0.01em' }}>
      <Hero />
      <main className="ss-wrap" style={{ display: 'grid', gap: 'clamp(48px, 6vw, 80px)', marginTop: -120 }}>
        <GameCard game={game} />
        <Curriculum game={game} />
        <StatsBand />
        <HelpSection />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
