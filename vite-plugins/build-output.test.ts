import { JSDOM } from 'jsdom';
import { build } from 'vite';
import { beforeAll, describe, expect, it } from 'vitest';
import { STATIC_PAGES } from '../src/app/pages.ts';
import type { Lang } from '../src/content/index.ts';
import { COPIES, content, PLACE_IDS, ui } from '../src/content/index.ts';

/** Files of an in-memory production build (nothing is written to disk), by name. */
async function buildSite(): Promise<Map<string, string>> {
  const result = await build({ mode: 'production', logLevel: 'silent', build: { write: false } });
  const files = new Map<string, string>();
  for (const output of Array.isArray(result) ? result : [result]) {
    if (!('output' in output)) throw new Error('Expected a build, not a watcher.');
    for (const file of output.output) {
      const source = file.type === 'chunk' ? file.code : file.source;
      files.set(
        file.fileName,
        typeof source === 'string' ? source : new TextDecoder().decode(source),
      );
    }
  }
  return files;
}

let files: Map<string, string>;

beforeAll(async () => {
  files = await buildSite();
}, 60_000);

function file(name: string): string {
  const source = files.get(name);
  if (source === undefined) throw new Error(`The build has no ${name}.`);
  return source;
}

/**
 * Loads a generated page in jsdom, which fetches no stylesheet: the bundled one is
 * inlined where it is linked, keeping the cascade order. jsdom keeps scripting
 * disabled, so <noscript> is parsed as markup, as in a browser without JavaScript.
 * With `javaScript`, the <noscript> blocks are left out, as a browser running
 * scripts ignores them (jsdom keeps the style of a <noscript> removed after parsing).
 */
function render(name: string, { javaScript = false } = {}): Window {
  let linked = 0;
  let html = file(name).replace(/<link rel="stylesheet"[^>]*href="\/([^"]+)"[^>]*>/g, (_, path) => {
    linked += 1;
    return `<style>${file(path as string)}</style>`;
  });
  expect(linked, `${name} links the bundled stylesheet`).toBe(1);
  if (javaScript) html = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  return new JSDOM(html).window;
}

/** Every page of the build and its language; 404.html, shared, is written in French. */
const PAGES: readonly (readonly [string, Lang])[] = [
  ['index.html', 'fr'],
  ['home.html', 'fr'],
  ['work.html', 'fr'],
  ['en.html', 'en'],
  ['en/home.html', 'en'],
  ['en/work.html', 'en'],
  ['404.html', 'fr'],
];

/** The loader, the text version and the computed values that matter. */
function boot(window: Window, page: string) {
  const { document } = window;
  const loader = document.getElementById('loader');
  const text = document.querySelector('#root > main.static-page');
  if (!loader || !text) throw new Error(`${page} lacks the loader or the text version.`);
  return {
    text,
    styles: {
      loader: window.getComputedStyle(loader).display,
      textVersion: window.getComputedStyle(text).display,
      scroll: window.getComputedStyle(document.body).overflow,
    },
  };
}

describe.each(PAGES)('%s', (page, lang) => {
  it('without JavaScript, shows the text version instead of the loader, in a page that scrolls', () => {
    const { content: copy } = COPIES[lang];
    const { text, styles } = boot(render(page), page);
    expect(styles).toEqual({ loader: 'none', textVersion: 'block', scroll: 'auto' });
    expect(text.querySelector('h1')?.textContent).toBe(copy.name);
    expect(Array.from(text.querySelectorAll('h2')).map((h2) => h2.textContent)).toEqual(
      PLACE_IDS.map((id) => copy.places[id].title),
    );
  });

  it('speaks its language: lang, loader and a link to the other language', () => {
    const { document } = render(page);
    expect(document.documentElement.lang).toBe(lang);
    expect(document.querySelector('.loader__label')?.textContent).toBe(COPIES[lang].ui.loading);
    const other = lang === 'fr' ? 'en' : 'fr';
    const link = document.querySelector(`.static-page a[hreflang="${other}"]`);
    expect(link?.getAttribute('href')).toBe(other === 'en' ? '/en' : '/');
  });

  it('with JavaScript, shows the loader until the game starts, the text version stays hidden', () => {
    const { styles } = boot(render(page, { javaScript: true }), page);
    expect(styles).toEqual({ loader: 'grid', textVersion: 'none', scroll: 'hidden' });
  });

  it('when the game cannot start (no-game, set by the script of the page), shows the text version', () => {
    const window = render(page, { javaScript: true });
    window.document.documentElement.classList.add('no-game');
    expect(boot(window, page).styles).toEqual({
      loader: 'none',
      textVersion: 'block',
      scroll: 'auto',
    });
  });

  it('watches for a game that cannot start before its script runs', () => {
    const html = file(page);
    const watcher = html.indexOf("root.classList.add('no-game')");
    expect(watcher).toBeGreaterThan(0);
    expect(watcher).toBeLessThan(html.indexOf('<script type="module"'));
    expect(html).toContain('<script nomodule>');
  });
});

describe('image preloads', () => {
  const preloads = (page: string) =>
    [...file(page).matchAll(/<link rel="preload" href="([^"]+)" as="image" \/>/g)].map(
      ([, href]) => href,
    );
  const map = (name: string) => {
    const asset = [...files.keys()].find((key) =>
      new RegExp(`^assets/${name}-[\\w-]+\\.webp$`).test(key),
    );
    if (!asset) throw new Error(`The build has no ${name} map.`);
    return `/${asset}`;
  };

  it.each(['index.html', 'work.html', 'en.html', 'en/work.html'])(
    'fetches the world map early on %s',
    (page) => {
      expect(preloads(page)).toEqual([map('world')]);
    },
  );

  it.each(['home.html', 'en/home.html'])('fetches the house early on %s', (page) => {
    expect(preloads(page)).toEqual([map('home')]);
  });

  it('preloads no image on 404.html', () => {
    expect(preloads('404.html')).toEqual([]);
  });
});

describe('page metadata', () => {
  const head = (page: string) => new JSDOM(file(page)).window.document.head;

  it.each(STATIC_PAGES.map((page) => [page.file, page] as const))(
    '%s has its own description and canonical URL',
    (name, page) => {
      const document = head(name);
      const description = document.querySelector('meta[name="description"]');
      expect(description?.getAttribute('content')).toBe(page.description);
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        new URL(page.path, 'https://pyve.is-a.dev').href,
      );
    },
  );

  it('gives the 404 page its own title, no canonical URL, and keeps it out of indexes', () => {
    const document = head('404.html');
    expect(document.querySelector('title')?.textContent).toBe(ui.pageTitle(content.notFound.title));
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });

  it.each(STATIC_PAGES.map((page) => page.file))('lets %s be indexed', (name) => {
    expect(head(name).querySelector('meta[name="robots"]')).toBeNull();
  });

  it.each(STATIC_PAGES.map((page) => [page.file, page] as const))(
    '%s links to itself in every language',
    (name, page) => {
      const links = Array.from(head(name).querySelectorAll('link[rel="alternate"][hreflang]')).map(
        (link) => [link.getAttribute('hreflang'), link.getAttribute('href')],
      );
      const route = page.route === '/' ? '' : page.route;
      expect(links).toEqual([
        ['fr', `https://pyve.is-a.dev${route || '/'}`],
        ['en', `https://pyve.is-a.dev/en${route}`],
        ['x-default', `https://pyve.is-a.dev${route || '/'}`],
      ]);
    },
  );
});

describe('crawler files', () => {
  // GitHub Pages serves the site on the domain of public/CNAME.
  const origin = 'https://pyve.is-a.dev';

  it('writes robots.txt for the origin of the site', () => {
    expect(file('robots.txt')).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });

  it('lists the three pages of each language in the sitemap', () => {
    const urls = [...file('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
    expect(urls).toEqual([
      `${origin}/`,
      `${origin}/home`,
      `${origin}/work`,
      `${origin}/en`,
      `${origin}/en/home`,
      `${origin}/en/work`,
    ]);
  });
});

describe('trailing slashes', () => {
  it.each(['home', 'work', 'en', 'en/home', 'en/work'])(
    'answers /%s/ with the page itself, canonical without the slash',
    (name) => {
      const copy = file(`${name}/index.html`);
      expect(copy).toBe(file(`${name}.html`));
      expect(copy).toContain(`<link rel="canonical" href="https://pyve.is-a.dev/${name}" />`);
    },
  );
});
