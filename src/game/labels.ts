import type { Note, Place, PlaceId, PlaceViewId, SiteContent, UiCopy } from '../content';
import { isNoteId, isPlaceViewId } from '../content';
import type { Interactable, NoteObject, PlaceObject } from '../engine/tiled';
import type { MapDefinition } from './maps';

/** What a `note` object says; the map parser has checked its id. */
export function noteOf(item: NoteObject, content: SiteContent): Note {
  if (!isNoteId(item.noteId)) throw new Error(`Unknown note "${item.noteId}".`);
  return content.notes[item.noteId];
}

/**
 * A place as one of its views tells it: the view's label, zone, title and lead
 * (the first paragraph) over the place's own; the place itself without a view.
 */
export function placeAs(id: PlaceId, view: PlaceViewId | null, content: SiteContent): Place {
  const place = content.places[id];
  if (view === null) return place;
  const told = place.views?.[view];
  if (!told) throw new Error(`Place "${id}" has no view "${view}".`);
  const [first, ...rest] = place.body;
  if (first?.kind !== 'paragraph') throw new Error(`Place "${id}" opens on no paragraph.`);
  const { lead, ...names } = told;
  return { ...place, ...names, body: [{ kind: 'paragraph', text: lead }, ...rest] };
}

/** The view a `place` object opens; the map parser has checked its id. */
export function objectView(item: PlaceObject<PlaceId>): PlaceViewId | null {
  if (item.view === null) return null;
  if (!isPlaceViewId(item.view)) throw new Error(`Unknown view "${item.view}".`);
  return item.view;
}

/** Short text shown above an object when the hero stands next to it. */
export function objectLabel(item: Interactable<PlaceId>, content: SiteContent, ui: UiCopy): string {
  if (item.kind === 'note') return noteOf(item, content).label;
  if (item.kind === 'place') return placeAs(item.placeId, objectView(item), content).label;
  return item.placeId === null ? ui.exitLabel : content.places[item.placeId].label;
}

/** HUD zone: the place of the nearby object, else the place of the map, else outdoors. */
export function zoneName(
  item: Interactable<PlaceId> | null,
  map: MapDefinition,
  content: SiteContent,
  ui: UiCopy,
): string {
  if (item?.kind === 'place') return placeAs(item.placeId, objectView(item), content).zone;
  const place = (item === null || item.kind === 'note' ? null : item.placeId) ?? map.place;
  return place === null ? ui.game.outdoorZone : content.places[place].zone;
}
