import type { ContentBlock, Link, SiteContent } from '../src/content/types.ts';
import { escapeHtml } from './site-pages.ts';

const text = escapeHtml;

function link({ label, href }: Link): string {
  return `<a href="${text(href)}">${text(label)}</a>`;
}

function links(list: readonly Link[]): string {
  return list.length === 0
    ? ''
    : `<ul>${list.map((item) => `<li>${link(item)}</li>`).join('')}</ul>`;
}

function block(item: ContentBlock): string {
  switch (item.kind) {
    case 'paragraph':
      return `<p>${text(item.text)}</p>`;
    case 'list':
      return `<ul>${item.items.map((entry) => `<li>${text(entry)}</li>`).join('')}</ul>`;
    case 'projects':
      return `<ul>${item.items
        .map(
          (project) =>
            `<li><h3>${text(project.name)}</h3><p>${text(project.summary)}</p>` +
            `<p>${project.tags.map(text).join(', ')}</p>${links(project.links)}</li>`,
        )
        .join('')}</ul>`;
  }
}

/**
 * The whole portfolio as plain HTML, like the text version of the app, for
 * visitors without JavaScript, for when the game cannot start, and for
 * crawlers that do not run scripts. Places come in the order of `placeIds`.
 */
export function renderStaticPage(
  content: SiteContent,
  placeIds: readonly (keyof SiteContent['places'])[],
  intro: string,
): string {
  const places = placeIds.map((id) => {
    const place = content.places[id];
    return `<section><h2>${text(place.title)}</h2>${place.body.map(block).join('')}${links(place.links)}</section>`;
  });
  return [
    '<main class="static-page">',
    `<h1>${text(content.name)}</h1>`,
    `<p class="static-page__role">${text(content.role)}</p>`,
    `<p class="static-page__intro">${text(intro)}</p>`,
    `<p>${text(content.pitch)}</p>`,
    ...places,
    '</main>',
  ].join('');
}
