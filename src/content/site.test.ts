import { describe, expect, it } from 'vitest';
import type { Lang } from './languages';
import { content as french } from './site';
import { content as english } from './site.en';
import type { Link, Place, PlaceId, PlaceView, Project, SiteContent } from './types';

const PLACE_IDS: PlaceId[] = ['home', 'work', 'lab', 'contact'];

/** Every link of a copy: place links plus the links of each project. */
function linksOf(content: SiteContent): Link[] {
  return PLACE_IDS.map((id) => content.places[id]).flatMap((place) => [
    ...place.links,
    ...place.body.flatMap((block) =>
      block.kind === 'projects' ? block.items.flatMap((project) => project.links) : [],
    ),
  ]);
}

/** A sentence's punctuation, as each language spaces it: no-break space in French, none in English. */
const MISSPACED: Readonly<Record<Lang, RegExp>> = { fr: / [?!:;]/, en: /\s[?!:;]/ };

/** A sentence ends on . ! or ? followed by whitespace (no-break space included) or the end. */
const SENTENCE_END = /[.!?](\s|$)/;

function firstSentence(text: string): string {
  const end = text.search(SENTENCE_END);
  return end === -1 ? text : text.slice(0, end + 1);
}

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((item) => allStrings(item));
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap((item) => allStrings(item));
  }
  return [];
}

describe.each([
  ['fr', french],
  ['en', english],
] as const)('site content (%s)', (lang, content) => {
  const places: Place[] = PLACE_IDS.map((id) => content.places[id]);
  const views: PlaceView[] = places.flatMap((place) => Object.values(place.views ?? {}));
  const projects: Project[] = content.places.work.body.flatMap((block) =>
    block.kind === 'projects' ? block.items : [],
  );
  const links = linksOf(content);

  it('defines the four places, each under its own id', () => {
    expect(Object.keys(content.places).sort()).toEqual([...PLACE_IDS].sort());
    const misfiled = PLACE_IDS.filter((id) => content.places[id].id !== id);
    expect(misfiled).toEqual([]);
  });

  it('keeps every place, view and note label within 12 characters', () => {
    const tooLong = [...places, ...views, ...Object.values(content.notes)]
      .filter((item) => Array.from(item.label).length > 12)
      .map((item) => item.label);
    expect(tooLong).toEqual([]);
  });

  it('gives every note a label and one sentence', () => {
    const notes = Object.values(content.notes);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.filter((note) => !note.label || !note.text.endsWith('.'))).toEqual([]);
  });

  it('spaces ? ! : ; as the language does', () => {
    expect(allStrings(content).filter((text) => MISSPACED[lang].test(text))).toEqual([]);
  });

  it('gives every place a zone, a title, a quest and a body', () => {
    const incomplete = places
      .filter((place) => !place.zone || !place.title || !place.quest || place.body.length === 0)
      .map((place) => place.id);
    expect(incomplete).toEqual([]);
  });

  it('gives every view a zone, a title and a lead, over a body that opens on a paragraph', () => {
    expect(views.length).toBeGreaterThan(0);
    expect(views.filter((view) => !view.zone || !view.title || !view.lead)).toEqual([]);
    const misread = places
      .filter((place) => place.views && place.body[0]?.kind !== 'paragraph')
      .map((place) => place.id);
    expect(misread).toEqual([]);
  });

  it('opens the pitch with a first sentence of 160 characters at most', () => {
    const sentence = firstSentence(content.pitch);
    expect(sentence.length).toBeGreaterThan(0);
    expect(sentence.length).toBeLessThanOrEqual(160);
  });

  it('keeps the pitch to two or three sentences', () => {
    const sentences = content.pitch.match(new RegExp(SENTENCE_END.source, 'g')) ?? [];
    expect(sentences.length).toBeGreaterThanOrEqual(2);
    expect(sentences.length).toBeLessThanOrEqual(3);
  });

  it('only links to https: or mailto:', () => {
    const allowed = /^(https:\/\/\S+|mailto:\S+)$/;
    const offenders = links.map((link) => link.href).filter((href) => !allowed.test(href));
    expect(links.length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });

  it('ships no draft marker', () => {
    const drafts = allStrings(content).filter((text) => /VALIDER|TODO|FIXME/i.test(text));
    expect(drafts).toEqual([]);
  });

  it('shows between 3 and 5 projects', () => {
    expect(projects.length).toBeGreaterThanOrEqual(3);
    expect(projects.length).toBeLessThanOrEqual(5);
  });

  it('gives every project a summary, tags and at least one link', () => {
    const incomplete = projects
      .filter(
        (project) => !project.summary || project.tags.length === 0 || project.links.length === 0,
      )
      .map((project) => project.name);
    expect(incomplete).toEqual([]);
  });

  it('avoids hollow marketing words', () => {
    const hollow = /passionn|innovant|sur[  ]mesure/i;
    expect(allStrings(content).filter((text) => hollow.test(text))).toEqual([]);
  });
});

/** The shape of a copy: what each language must have alike, whatever its words. */
function shapeOf(content: SiteContent) {
  return {
    places: PLACE_IDS.map((id) => {
      const place = content.places[id];
      return {
        id: place.id,
        views: Object.keys(place.views ?? {}),
        description: place.description !== undefined,
        body: place.body.map((block) =>
          block.kind === 'paragraph'
            ? 'paragraph'
            : block.kind === 'list'
              ? `list of ${String(block.items.length)}`
              : block.items.map((project) => project.tags.length),
        ),
      };
    }),
    notes: Object.keys(content.notes),
    help: content.help.steps.length,
  };
}

describe('the English copy', () => {
  it('has the shape of the French one: places, blocks, list items, views and notes', () => {
    expect(shapeOf(english)).toEqual(shapeOf(french));
  });

  it('links to the same addresses, in the same order', () => {
    expect(linksOf(english).map((link) => link.href)).toEqual(
      linksOf(french).map((link) => link.href),
    );
  });

  it('keeps the names that are not translated', () => {
    expect(english.name).toBe(french.name);
    expect(english.role).toBe(french.role);
  });
});
