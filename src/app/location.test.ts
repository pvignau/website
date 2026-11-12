import { afterEach, describe, expect, it } from 'vitest';
import { legacyHashRoute, normalizeLocation, routeOf } from './location';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('routeOf', () => {
  it.each([
    ['/', '/'],
    ['/index.html', '/'],
    ['/index', '/'],
    ['/home', '/home'],
    ['/home/', '/home'],
    ['/home.html', '/home'],
    ['/home/index.html', '/home'],
    ['/HOME', '/home'],
    ['/work', '/work'],
    ['/work//', '/work'],
    ['//work', '/work'],
    ['/Work.HTML', '/work'],
  ])('reads %s as %s', (pathname, route) => {
    expect(routeOf(pathname)).toBe(route);
  });

  it.each(['/nowhere', '/404.html', '/homes', '/home/kitchen', '/work.htm'])(
    'knows no route for %s',
    (pathname) => {
      expect(routeOf(pathname)).toBeNull();
    },
  );
});

describe('legacyHashRoute', () => {
  it('turns old hash links into routes', () => {
    expect(legacyHashRoute('#/home')).toBe('/home');
    expect(legacyHashRoute('#/work')).toBe('/work');
    expect(legacyHashRoute('#/')).toBe('/');
  });

  it('leaves other hashes alone, crafted ones included', () => {
    for (const hash of ['', '#portfolio', '#//evil.example/x', '#/\\evil.example', '#/nowhere']) {
      expect(legacyHashRoute(hash), hash).toBeNull();
    }
  });
});

describe('normalizeLocation', () => {
  const at = (url: string) => {
    window.history.replaceState({ kept: true }, '', url);
    normalizeLocation(window.location, window.history);
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  };

  it('rewrites the address of a known page, keeping the query, the hash and the state', () => {
    expect(at('/home.html?debug#portfolio')).toBe('/home?debug#portfolio');
    expect(at('/work/')).toBe('/work');
    expect(at('/index.html')).toBe('/');
    expect(window.history.state).toEqual({ kept: true });
  });

  it('follows old hash links', () => {
    expect(at('/#/work')).toBe('/work');
    expect(at('/?debug#/home')).toBe('/home?debug');
  });

  it('leaves unknown pages and crafted hashes alone, without throwing', () => {
    expect(at('/nowhere/at/all')).toBe('/nowhere/at/all');
    expect(at('/#//evil.example/x')).toBe('/#//evil.example/x');
  });

  it('survives a history that refuses the rewrite', () => {
    window.history.replaceState(null, '', '/home.html');
    const refusing = {
      state: null,
      replaceState: () => {
        throw new DOMException('Denied', 'SecurityError');
      },
    } as unknown as History;
    expect(() => {
      normalizeLocation(window.location, refusing);
    }).not.toThrow();
  });
});
