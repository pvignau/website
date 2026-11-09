import { describe, expect, it } from 'vitest';
import { content } from './site';
import type { Link, Place, PlaceId, Project } from './types';

const PLACE_IDS: PlaceId[] = ['home', 'work', 'lab', 'contact'];
const places: Place[] = PLACE_IDS.map((id) => content.places[id]);

const projects: Project[] = content.places.work.body.flatMap((block) =>
  block.kind === 'projects' ? block.items : [],
);

/** Every link of the site: place links plus the links of each project. */
const links: Link[] = places.flatMap((place) => [
  ...place.links,
  ...place.body.flatMap((block) =>
    block.kind === 'projects' ? block.items.flatMap((project) => project.links) : [],
  ),
]);

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

describe('site content', () => {
  it('defines the four places, each under its own id', () => {
    expect(Object.keys(content.places).sort()).toEqual([...PLACE_IDS].sort());
    const misfiled = PLACE_IDS.filter((id) => content.places[id].id !== id);
    expect(misfiled).toEqual([]);
  });

  it('keeps every place and note label within 12 characters', () => {
    const tooLong = [...places, ...Object.values(content.notes)]
      .filter((item) => Array.from(item.label).length > 12)
      .map((item) => item.label);
    expect(tooLong).toEqual([]);
  });

  it('gives every note a label and one sentence', () => {
    const notes = Object.values(content.notes);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.filter((note) => !note.label || !note.text.endsWith('.'))).toEqual([]);
  });

  it('puts a no-break space, never a plain one, before ? ! : ;', () => {
    expect(allStrings(content).filter((text) => / [?!:;]/.test(text))).toEqual([]);
  });

  it('gives every place a zone, a title, a quest and a body', () => {
    const incomplete = places
      .filter((place) => !place.zone || !place.title || !place.quest || place.body.length === 0)
      .map((place) => place.id);
    expect(incomplete).toEqual([]);
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
