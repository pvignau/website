import { describe, expect, it } from 'vitest';
import { LANGS } from '../content';
import { pageOf, PATHS, STATIC_PAGES, translationsOf } from './pages';

describe('static pages', () => {
  it('has one page per route and language, French first from index.html', () => {
    for (const lang of LANGS) {
      const routes = STATIC_PAGES.filter((page) => page.lang === lang).map((page) => page.route);
      expect(routes.sort(), lang).toEqual(Object.values(PATHS).sort());
    }
    expect(STATIC_PAGES[0]).toMatchObject({ file: 'index.html', lang: 'fr', path: '/' });
    expect(pageOf('/nowhere', 'fr')).toBeNull();
  });

  it('serves French without a prefix, English under /en', () => {
    expect(pageOf(PATHS.work, 'fr')).toMatchObject({ file: 'work.html', path: '/work' });
    expect(pageOf(PATHS.work, 'en')).toMatchObject({ file: 'en/work.html', path: '/en/work' });
    expect(pageOf(PATHS.world, 'en')).toMatchObject({ file: 'en.html', path: '/en' });
  });

  it('pairs each page with its translations', () => {
    const home = pageOf(PATHS.home, 'en');
    if (!home) throw new Error('No English house.');
    expect(translationsOf(home).map((page) => page.path)).toEqual(['/home', '/en/home']);
  });

  it('describes each page with its own text, in 160 characters at most', () => {
    const descriptions = STATIC_PAGES.map((page) => page.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const description of descriptions) {
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });
});
