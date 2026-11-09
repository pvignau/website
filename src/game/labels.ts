import type { SiteContent, UiCopy } from '../content';
import type { PlaceId } from '../content';
import type { Interactable } from '../engine/tiled';
import type { MapDefinition } from './maps';

/** Short text shown above an object when the hero stands next to it. */
export function objectLabel(item: Interactable<PlaceId>, content: SiteContent, ui: UiCopy): string {
  return item.placeId === null ? ui.exitLabel : content.places[item.placeId].label;
}

/** HUD zone: the place of the nearby object, else the place of the map, else outdoors. */
export function zoneName(
  item: Interactable<PlaceId> | null,
  map: MapDefinition,
  content: SiteContent,
  ui: UiCopy,
): string {
  const place = item?.placeId ?? map.place;
  return place === null ? ui.game.outdoorZone : content.places[place].zone;
}
