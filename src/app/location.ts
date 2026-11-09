import { PATHS } from './pages';

const ROUTES: readonly string[] = Object.values(PATHS);

/**
 * The route a URL path stands for, or null for an unknown path (the 404 page).
 * GitHub Pages also serves `/index.html`, `/home.html` or `/work.html`, and its
 * 404.html answers `/work/` or `/HOME`: they all stand for a route.
 */
export function routeOf(pathname: string): string | null {
  const path =
    pathname
      .replace(/\/{2,}/g, '/')
      .replace(/\/+$/, '')
      .replace(/(?:\/index)?(?:\.html)?$/i, '')
      .toLowerCase() || '/';
  return ROUTES.find((route) => route === path) ?? null;
}

/**
 * The site used hash routing (`/#/home`). Returns the route an old hash link
 * stands for, or null for any other hash (`#portfolio`, or a crafted `#//host`).
 */
export function legacyHashRoute(hash: string): string | null {
  return hash.startsWith('#/') ? routeOf(hash.slice(1)) : null;
}

/**
 * Rewrites the address in place, before the router reads it: an old `/#/home`
 * link becomes `/home`, `/home.html` or `/work/` become `/home` or `/work`.
 * Unknown paths are left alone, for the 404 page.
 */
export function normalizeLocation(location: Location, history: History): void {
  const legacy = legacyHashRoute(location.hash);
  const route = legacy ?? routeOf(location.pathname);
  if (route === null) return;
  const target = `${route}${location.search}${legacy === null ? location.hash : ''}`;
  if (target === `${location.pathname}${location.search}${location.hash}`) return;
  try {
    history.replaceState(history.state, '', target);
  } catch {
    // A sandboxed frame may refuse: the app still shows the right page (see routeOf).
  }
}
