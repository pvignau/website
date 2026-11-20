// Loaded by vite.config.ts too: full file names, for Node's loader.
import type { Lang } from '../content/index.ts';
import { COPIES, LANGS } from '../content/index.ts';
import { localizedPath } from './language.ts';

/** Every route of the site. Tiled `redirect` objects must point to one of them. */
export const PATHS = {
  world: '/',
  home: '/home',
  work: '/work',
} as const;

export interface StaticPage {
  /** File written to dist/: GitHub Pages serves /home from home.html, with a 200. */
  readonly file: string;
  readonly lang: Lang;
  /** The route the app shows (`/home`), the same in every language. */
  readonly route: string;
  /** Its address in the page's language: `/home`, `/en/home`. */
  readonly path: string;
  readonly title: string;
  /** Meta description: what search results show under the title. */
  readonly description: string;
  /** Images shown first (source paths), preloaded with the script. */
  readonly preload?: readonly string[];
}

/** The world map: the first thing / and /work show, and by far their largest file. */
const WORLD_MAP = 'src/maps/world.webp';
/** The house: too large now to be inlined in the script, it is fetched alongside it. */
const HOME_MAP = 'src/maps/home.webp';

/** The file GitHub Pages serves for an address: `/` index.html, `/en` en.html, `/en/home` en/home.html. */
function fileOf(path: string): string {
  return path === '/' ? 'index.html' : `${path.slice(1)}.html`;
}

function pagesIn(lang: Lang): StaticPage[] {
  const { content, ui } = COPIES[lang];
  const page = (route: string, title: string, description: string, preload: string[]) => {
    const path = localizedPath(lang, route);
    return { file: fileOf(path), lang, route, path, title, description, preload };
  };
  return [
    page(PATHS.world, ui.pageTitle(null), content.description, [WORLD_MAP]),
    page(
      PATHS.home,
      ui.pageTitle(content.places.home.zone),
      content.places.home.description ?? content.description,
      [HOME_MAP],
    ),
    page(
      PATHS.work,
      ui.pageTitle(content.places.work.title),
      content.places.work.description ?? content.description,
      [WORLD_MAP],
    ),
  ];
}

/**
 * Pages generated at build time (see vite-plugins/site-pages.ts), French first,
 * from index.html; 404.html covers the rest, in every language.
 */
export const STATIC_PAGES: readonly StaticPage[] = LANGS.flatMap(pagesIn);

/** The page of a route in a language, or null for an unknown route. */
export function pageOf(route: string | null, lang: Lang): StaticPage | null {
  return STATIC_PAGES.find((page) => page.route === route && page.lang === lang) ?? null;
}

/** The same route in every language, the page's own included: what `hreflang` links to. */
export function translationsOf(page: StaticPage): StaticPage[] {
  return STATIC_PAGES.filter((other) => other.route === page.route);
}
