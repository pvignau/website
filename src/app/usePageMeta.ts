import { useEffect } from 'react';
import type { Lang } from '../content';
import { DEFAULT_LANG, LANGUAGES } from '../content';
import type { StaticPage } from './pages';
import { pageOf, PATHS, translationsOf } from './pages';

/** Finds a <meta> or <link> of <head>, creating it when missing. */
function headTag(selector: string, create: () => HTMLElement): HTMLElement {
  const found = document.head.querySelector<HTMLElement>(selector);
  if (found) return found;
  const element = create();
  document.head.append(element);
  return element;
}

function setMeta(key: 'name' | 'property', name: string, value: string | null): void {
  const selector = `meta[${key}="${name}"]`;
  if (value === null) {
    document.head.querySelector(selector)?.remove();
    return;
  }
  headTag(selector, () => {
    const meta = document.createElement('meta');
    meta.setAttribute(key, name);
    return meta;
  }).setAttribute('content', value);
}

function setCanonical(url: string | null): void {
  if (url === null) {
    document.head.querySelector('link[rel="canonical"]')?.remove();
    return;
  }
  headTag('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.rel = 'canonical';
    return link;
  }).setAttribute('href', url);
}

/** The `hreflang` links of a page: one per language, and the default one as `x-default`. */
function setAlternates(page: StaticPage | null): void {
  for (const link of document.head.querySelectorAll('link[rel="alternate"][hreflang]')) {
    link.remove();
  }
  if (page === null) return;
  const translations = translationsOf(page);
  const fallback = translations.find((translation) => translation.lang === DEFAULT_LANG);
  const links = [
    ...translations.map((translation) => [translation.lang, translation.path] as const),
    ...(fallback ? [['x-default', fallback.path] as const] : []),
  ];
  for (const [hreflang, path] of links) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    link.href = new URL(path, __SITE_ORIGIN__).href;
    document.head.append(link);
  }
}

/**
 * Keeps the description, the canonical URL (and their Open Graph copies) and
 * the links to the other languages in step with the page shown. Moving around
 * in the app changes the URL, not the HTML written for the first page, and
 * Chrome on Android shares the canonical URL. `null` is the 404 page: no
 * canonical URL, the description of the home page of its language.
 */
export function usePageMeta(page: StaticPage | null, lang: Lang): void {
  useEffect(() => {
    const description = (page ?? pageOf(PATHS.world, lang))?.description ?? null;
    const url = page ? new URL(page.path, __SITE_ORIGIN__).href : null;
    setMeta('name', 'description', description);
    setMeta('property', 'og:description', description);
    setCanonical(url);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:locale', LANGUAGES[lang].locale);
    setAlternates(page);
  }, [page, lang]);
}
