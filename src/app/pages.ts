// Loaded by vite.config.ts too: full file names, for Node's loader.
import { content, ui } from '../content/index.ts';

/** Every route of the site. Tiled `redirect` objects must point to one of them. */
export const PATHS = {
  world: '/',
  home: '/home',
  work: '/work',
} as const;

export interface StaticPage {
  /** File written to dist/: GitHub Pages serves /home from home.html, with a 200. */
  readonly file: string;
  readonly path: string;
  readonly title: string;
  /** Meta description: what search results show under the title. */
  readonly description: string;
  /** Images shown first (source paths), preloaded with the script. */
  readonly preload?: readonly string[];
}

/** The world map: the first thing / and /work show, and by far their largest file. */
const WORLD_MAP = 'src/maps/world.webp';

/** Pages generated at build time (see vite-plugins/site-pages.ts); 404.html covers the rest. */
export const STATIC_PAGES: readonly StaticPage[] = [
  {
    file: 'index.html',
    path: PATHS.world,
    title: ui.pageTitle(null),
    description: content.description,
    preload: [WORLD_MAP],
  },
  {
    file: 'home.html',
    path: PATHS.home,
    title: ui.pageTitle(content.places.home.zone),
    description: content.places.home.description ?? content.description,
  },
  {
    file: 'work.html',
    path: PATHS.work,
    title: ui.pageTitle(content.places.work.title),
    description: content.places.work.description ?? content.description,
    preload: [WORLD_MAP],
  },
];

/** The page of a route, or null for an unknown one. */
export function pageOf(route: string | null): StaticPage | null {
  return STATIC_PAGES.find((page) => page.path === route) ?? null;
}
