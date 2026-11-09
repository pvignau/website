import { useEffect } from 'react';
import type { StaticPage } from './pages';
import { STATIC_PAGES } from './pages';

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

/**
 * Keeps the description and the canonical URL (and their Open Graph copies) in
 * step with the page shown. Moving around in the app changes the URL, not the
 * HTML written for the first page, and Chrome on Android shares the canonical
 * URL. `null` is the 404 page: no canonical URL, the home page's description.
 */
export function usePageMeta(page: StaticPage | null): void {
  useEffect(() => {
    const description = page?.description ?? STATIC_PAGES[0]?.description ?? null;
    const url = page ? new URL(page.path, __SITE_ORIGIN__).href : null;
    setMeta('name', 'description', description);
    setMeta('property', 'og:description', description);
    setCanonical(url);
    setMeta('property', 'og:url', url);
  }, [page]);
}
