import { describe, expect, it } from 'vitest';
import { content, PLACE_IDS } from '../src/content/index.ts';
import type { SiteContent } from '../src/content/types.ts';
import { renderStaticPage } from './static-page.ts';

describe('renderStaticPage', () => {
  const html = renderStaticPage(content, PLACE_IDS, 'Le jeu a besoin de JavaScript.');

  it('holds the whole portfolio: name, role, pitch, every place, every link', () => {
    expect(html).toMatch(/^<main class="static-page"><h1>Pyve<\/h1>/);
    for (const id of PLACE_IDS) expect(html).toContain(`<h2>${content.places[id].title}</h2>`);
    const hrefs = [...html.matchAll(/<a href="([^"]+)">/g)].map(([, href = '']) => href);
    const places = PLACE_IDS.map((id) => content.places[id]);
    const expected = places.flatMap((place) => [
      ...place.body.flatMap((block) =>
        block.kind === 'projects'
          ? block.items.flatMap((project) => project.links.map((link) => link.href))
          : [],
      ),
      ...place.links.map((link) => link.href),
    ]);
    expect(hrefs.map((href) => href.replaceAll('&amp;', '&'))).toEqual(expected);
    expect(html).toContain('<p class="static-page__intro">Le jeu a besoin de JavaScript.</p>');
  });

  it('puts project names one level below their place', () => {
    const projects = content.places.work.body.flatMap((block) =>
      block.kind === 'projects' ? block.items : [],
    );
    expect(projects.length).toBeGreaterThan(0);
    for (const project of projects) expect(html).toContain(`<h3>${project.name}</h3>`);
  });

  it('writes text as text, never as markup', () => {
    const tricky: SiteContent = {
      ...content,
      name: 'Pyve <b>',
      places: {
        ...content.places,
        home: {
          ...content.places.home,
          body: [{ kind: 'paragraph', text: '<script>alert(1)</script> & co' }],
          links: [{ label: 'Lien "spécial"', href: 'https://example.com/?a=1&b=2' }],
        },
      },
    };
    const out = renderStaticPage(tricky, ['home'], 'Intro');
    expect(out).toContain('<h1>Pyve &lt;b&gt;</h1>');
    expect(out).toContain('<p>&lt;script&gt;alert(1)&lt;/script&gt; &amp; co</p>');
    expect(out).toContain(
      '<a href="https://example.com/?a=1&amp;b=2">Lien &quot;spécial&quot;</a>',
    );
    expect(out).not.toContain('<script>');
  });
});
