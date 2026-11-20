import { describe, expect, it } from 'vitest';
import { languageOf, localizedPath, splitLanguage } from './language';

describe('splitLanguage', () => {
  it.each([
    ['/', 'fr', '/'],
    ['/home', 'fr', '/home'],
    ['/en', 'en', '/'],
    ['/en/', 'en', '/'],
    ['/en.html', 'en', '/index.html'],
    ['/en/index.html', 'en', '/index.html'],
    ['/en/home', 'en', '/home'],
    ['/EN/Work.html', 'en', '/Work.html'],
    ['/en/nowhere', 'en', '/nowhere'],
  ])('reads %s as %s %s', (pathname, lang, path) => {
    expect(splitLanguage(pathname)).toEqual({ lang, path });
  });

  it('only takes a whole first segment for a language', () => {
    expect(splitLanguage('/english')).toEqual({ lang: 'fr', path: '/english' });
    expect(splitLanguage('/home/en')).toEqual({ lang: 'fr', path: '/home/en' });
    expect(languageOf('/enhance')).toBe('fr');
  });
});

describe('localizedPath', () => {
  it('leaves French paths as they are', () => {
    expect(localizedPath('fr', '/')).toBe('/');
    expect(localizedPath('fr', '/work?debug')).toBe('/work?debug');
  });

  it('puts English under /en, its world map on the bare prefix', () => {
    expect(localizedPath('en', '/')).toBe('/en');
    expect(localizedPath('en', '/?debug')).toBe('/en?debug');
    expect(localizedPath('en', '/home')).toBe('/en/home');
    expect(localizedPath('en', '/work?debug')).toBe('/en/work?debug');
  });

  it('goes back and forth with splitLanguage', () => {
    for (const path of ['/', '/home', '/work']) {
      expect(splitLanguage(localizedPath('en', path))).toEqual({ lang: 'en', path });
    }
  });
});
