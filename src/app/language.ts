// Loaded by vite.config.ts too (through pages.ts): full file names, for Node's loader.
import type { Lang } from '../content/index.ts';
import { DEFAULT_LANG, LANGS, LANGUAGES } from '../content/index.ts';

/**
 * A URL path split into its language and the path the app routes on:
 * `/en/home` is English `/home`, `/en` and `/en/` English `/`, anything else
 * French. Only a whole first segment counts: `/english` stays French (a 404).
 */
export function splitLanguage(pathname: string): { lang: Lang; path: string } {
  for (const lang of LANGS) {
    const { prefix } = LANGUAGES[lang];
    if (prefix === '') continue;
    const head = pathname.slice(0, prefix.length).toLowerCase();
    const rest = pathname.slice(prefix.length);
    if (head === prefix && (rest === '' || rest.startsWith('/') || rest.startsWith('.'))) {
      // `/en.html` (GitHub Pages serves it for /en) is the world map, as `/index.html` is.
      return { lang, path: rest.startsWith('.') ? `/index${rest}` : rest || '/' };
    }
  }
  return { lang: DEFAULT_LANG, path: pathname };
}

/** The language a URL path is in. */
export function languageOf(pathname: string): Lang {
  return splitLanguage(pathname).lang;
}

/** The address of a path of the app (`/home`, `/work?debug`) in a language: `/en/home`. */
export function localizedPath(lang: Lang, path: string): string {
  const { prefix } = LANGUAGES[lang];
  if (prefix === '') return path;
  // The world map of a language is its bare prefix, as / is for French: `/en`, `/en?debug`.
  return path === '/' || /^\/[?#]/.test(path) ? `${prefix}${path.slice(1)}` : `${prefix}${path}`;
}
