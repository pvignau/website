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

/** A link to the same portfolio in another language, named in that language. */
export interface Translation {
  readonly lang: string;
  readonly name: string;
  readonly href: string;
}

/**
 * The whole portfolio as plain HTML, like the text version of the app, for
 * visitors without JavaScript, for when the game cannot start, and for
 * crawlers that do not run scripts. Places come in the order of `placeIds`;
 * `translations` link to the other languages.
 */
export function renderStaticPage(
  content: SiteContent,
  placeIds: readonly (keyof SiteContent['places'])[],
  intro: string,
  translations: readonly Translation[] = [],
): string {
  const places = placeIds.map((id) => {
    const place = content.places[id];
    return `<section><h2>${text(place.title)}</h2>${place.body.map(block).join('')}${links(place.links)}</section>`;
  });
  return [
    '<main class="static-page">',
    // The cover of the comic (boot.css), then one panel per place.
    '<header class="static-page__header">',
    `<h1>${text(content.name)}</h1>`,
    `<p class="static-page__role">${text(content.role)}</p>`,
    ...translations.map(
      ({ lang, name, href }) =>
        `<p><a href="${text(href)}" hreflang="${text(lang)}" lang="${text(lang)}">${text(name)}</a></p>`,
    ),
    `<p class="static-page__intro">${text(intro)}</p>`,
    `<p>${text(content.pitch)}</p>`,
    '</header>',
    ...places,
    '</main>',
  ].join('');
}
