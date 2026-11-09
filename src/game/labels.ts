import type { Note, SiteContent, UiCopy } from '../content';
import type { PlaceId } from '../content';
import { isNoteId } from '../content';
import type { Interactable, NoteObject } from '../engine/tiled';
import type { MapDefinition } from './maps';

/** What a `note` object says; the map parser has checked its id. */
export function noteOf(item: NoteObject, content: SiteContent): Note {
  if (!isNoteId(item.noteId)) throw new Error(`Unknown note "${item.noteId}".`);
  return content.notes[item.noteId];
}

/** Short text shown above an object when the hero stands next to it. */
export function objectLabel(item: Interactable<PlaceId>, content: SiteContent, ui: UiCopy): string {
  if (item.kind === 'note') return noteOf(item, content).label;
  return item.placeId === null ? ui.exitLabel : content.places[item.placeId].label;
}

/** HUD zone: the place of the nearby object, else the place of the map, else outdoors. */
export function zoneName(
  item: Interactable<PlaceId> | null,
  map: MapDefinition,
  content: SiteContent,
  ui: UiCopy,
): string {
  const place = (item === null || item.kind === 'note' ? null : item.placeId) ?? map.place;
  return place === null ? ui.game.outdoorZone : content.places[place].zone;
}
