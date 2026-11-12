import { describe, expect, it } from 'vitest';
import { pageOf, PATHS, STATIC_PAGES } from './pages';

describe('static pages', () => {
  it('has one page per route', () => {
    expect(STATIC_PAGES.map((page) => page.path).sort()).toEqual(Object.values(PATHS).sort());
    expect(pageOf('/work')?.file).toBe('work.html');
    expect(pageOf('/nowhere')).toBeNull();
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
