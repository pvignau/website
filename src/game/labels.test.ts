import { describe, expect, it } from 'vitest';
import { content, ui } from '../content';
import type { Interactable } from '../engine/tiled';
import type { PlaceId } from '../content';
import { noteOf, objectLabel, placeAs, zoneName } from './labels';
import { MAPS } from './maps';

const rect = { x: 0, y: 0, width: 8, height: 8 };
const place: Interactable<PlaceId> = {
  kind: 'place',
  id: '1',
  name: 'lab',
  placeId: 'lab',
  view: null,
  rect,
  radius: 24,
};
const desk: Interactable<PlaceId> = {
  ...place,
  id: '5',
  name: 'home',
  placeId: 'home',
  view: 'office',
};
const exit: Interactable<PlaceId> = {
  kind: 'warp',
  id: '2',
  name: 'exit',
  to: '/',
  placeId: null,
  rect,
  radius: 24,
};
const door: Interactable<PlaceId> = {
  kind: 'warp',
  id: '3',
  name: 'home',
  to: '/home',
  placeId: 'home',
  rect,
  radius: 24,
};
const note = { kind: 'note', id: '4', name: 'tv', noteId: 'tv', rect, radius: 24 } as const;

describe('objectLabel', () => {
  it('names places and doors after their place, the other doors "Sortir"', () => {
    expect(objectLabel(place, content, ui)).toBe(content.places.lab.label);
    expect(objectLabel(door, content, ui)).toBe(content.places.home.label);
    expect(objectLabel(exit, content, ui)).toBe(ui.exitLabel);
  });

  it('names an object that opens a view after the view', () => {
    expect(objectLabel(desk, content, ui)).toBe(content.places.home.views?.office?.label);
  });

  it('names notes after their own label', () => {
    expect(objectLabel(note, content, ui)).toBe(content.notes.tv.label);
  });
});

describe('zoneName', () => {
  it("gives the zone of the place nearby, else the map's, else outdoors", () => {
    expect(zoneName(place, MAPS.world, content, ui)).toBe(content.places.lab.zone);
    expect(zoneName(null, MAPS.world, content, ui)).toBe(ui.game.outdoorZone);
    expect(zoneName(exit, MAPS.home, content, ui)).toBe(content.places.home.zone);
  });

  it('gives the zone of the view by an object that opens one', () => {
    expect(zoneName(desk, MAPS.home, content, ui)).toBe(content.places.home.views?.office?.zone);
  });

  it('keeps the zone of the map by a note: the house', () => {
    expect(zoneName(note, MAPS.home, content, ui)).toBe(content.places.home.zone);
  });
});

describe('placeAs', () => {
  const home = content.places.home;

  it('gives the place itself without a view', () => {
    expect(placeAs('home', null, content)).toBe(home);
  });

  it("tells the place as its view does: the view's names and lead, then the place's body", () => {
    const office = home.views?.office;
    const told = placeAs('home', 'office', content);
    expect(told).toMatchObject({ id: 'home', label: office?.label, zone: office?.zone });
    expect(told.title).toBe(office?.title);
    expect(told.body[0]).toEqual({ kind: 'paragraph', text: office?.lead });
    expect(told.body.slice(1)).toEqual(home.body.slice(1));
    expect(told.links).toBe(home.links);
    expect(told.quest).toBe(home.quest);
  });

  it('refuses a view the place does not have', () => {
    expect(() => placeAs('lab', 'office', content)).toThrow(/Place "lab" has no view "office"/);
  });
});

describe('noteOf', () => {
  it('reads what a note says, and refuses an unknown one', () => {
    expect(noteOf(note, content)).toBe(content.notes.tv);
    expect(() => noteOf({ ...note, noteId: 'radio' }, content)).toThrow(/Unknown note "radio"/);
  });
});
