import { GameScreen } from '../game/GameScreen';
import type { AppHistory } from './history';
import { routeOf } from './location';
import { HistoryContext, useLocation } from './navigation';
import { NotFound } from './NotFound';
import { PATHS } from './pages';
import { RouteError } from './RouteError';

/** `/` and `/work` share the world screen: opening the projects keeps the hero in place. */
function screenOf(pathname: string): 'world' | 'home' | 'not-found' {
  switch (routeOf(pathname)) {
    case PATHS.world:
    case PATHS.work:
      return 'world';
    case PATHS.home:
      return 'home';
    default:
      return 'not-found';
  }
}

function Routes() {
  const screen = screenOf(useLocation().pathname);
  return (
    // Keyed by screen: after a crash, moving to another screen starts without the error.
    <RouteError key={screen}>
      {screen === 'not-found' ? <NotFound /> : <GameScreen key={screen} mapId={screen} />}
    </RouteError>
  );
}

/**
 * History routing over three static routes. GitHub Pages serves 404.html (a
 * copy of the app) for unknown paths, where the app shows its own 404 page. A
 * crash shows the game's error page instead of a blank screen.
 */
export function App({ history }: { history: AppHistory }) {
  return (
    <HistoryContext value={history}>
      <Routes />
    </HistoryContext>
  );
}
