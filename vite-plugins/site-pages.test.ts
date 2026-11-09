import { describe, expect, it } from 'vitest';
import type { SiteMetadata } from './site-pages.ts';
import { escapeHtml, metaBlock, NOSCRIPT_STYLE, robots, sitemap } from './site-pages.ts';

const site: SiteMetadata = {
  origin: 'https://pyve.is-a.dev',
  locale: 'fr_FR',
  siteName: 'Le monde de Pyve',
  image: { path: '/og-image.png', width: 1200, height: 630, alt: 'Deux îles' },
  loading: 'Chargement…',
  staticPage: '<main class="static-page"><h1>Pyve</h1></main>',
  pages: [
    { file: 'index.html', path: '/', title: 'Le monde de Pyve', description: "L'accueil." },
    {
      file: 'work.html',
      path: '/work',
      title: 'Projets · Le monde de Pyve',
      description: 'Un portfolio "jouable" & en <pixel art>.',
    },
  ],
  fallback: { file: '404.html', title: 'Plouf ! · Le monde de Pyve' },
};

describe('site pages', () => {
  it('escapes text and attributes', () => {
    expect(escapeHtml(`<a href="x">L'été & co</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;L&#39;été &amp; co&lt;/a&gt;',
    );
  });

  it('gives each page its own title, canonical URL and Open Graph data', () => {
    const work = metaBlock(site, site.pages[1] ?? null);
    expect(work).toContain('<title>Projets · Le monde de Pyve</title>');
    expect(work).toContain('<link rel="canonical" href="https://pyve.is-a.dev/work" />');
    expect(work).toContain('<meta property="og:url" content="https://pyve.is-a.dev/work" />');
    expect(work).toContain('content="https://pyve.is-a.dev/og-image.png"');
    expect(work).toContain(
      'content="Un portfolio &quot;jouable&quot; &amp; en &lt;pixel art&gt;."',
    );
  });

  it('describes each page with its own text', () => {
    const home = metaBlock(site, site.pages[0] ?? null);
    expect(home).not.toContain('noindex');
    expect(home).toContain('<meta name="description" content="L&#39;accueil." />');
    expect(home).toContain('<meta property="og:description" content="L&#39;accueil." />');
    expect(home).not.toContain('jouable');
  });

  it('gives the fallback page its title, no canonical URL, and keeps it out of indexes', () => {
    const fallback = metaBlock(site, null);
    expect(fallback).toContain('<title>Plouf ! · Le monde de Pyve</title>');
    expect(fallback).toContain('<meta name="robots" content="noindex" />');
    expect(fallback).toContain('<meta name="description" content="L&#39;accueil." />');
    expect(fallback).not.toContain('rel="canonical"');
    expect(fallback).not.toContain('og:url');
  });

  it('shows the text version instead of the loader without JavaScript, whatever the cascade', () => {
    expect(NOSCRIPT_STYLE).toContain('html #loader{display:none!important}');
    expect(NOSCRIPT_STYLE).toContain('html .static-page{display:block!important}');
  });

  it('points crawlers to the sitemap of the same origin', () => {
    expect(robots(site)).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://pyve.is-a.dev/sitemap.xml\n',
    );
  });

  it('lists every page in the sitemap', () => {
    expect(sitemap(site)).toContain('<loc>https://pyve.is-a.dev/work</loc>');
    expect(sitemap(site).match(/<url>/g)).toHaveLength(2);
  });
});
