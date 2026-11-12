import type { PlaceId, PlaceViewId } from './types.ts';

/** A `Record` makes the compiler reject a missing or unknown place id. */
const PLACE_ORDER: Record<PlaceId, true> = { home: true, work: true, lab: true, contact: true };

/** Every place, in the order of the quest log and of the text version. */
export const PLACE_IDS = Object.freeze(Object.keys(PLACE_ORDER) as PlaceId[]);

export function isPlaceId(value: string): value is PlaceId {
  return Object.hasOwn(PLACE_ORDER, value);
}

/** A `Record`, likewise, for the views of a place. */
const PLACE_VIEWS: Record<PlaceViewId, true> = { office: true };

/** Every view, for the map parser: a `view` with another name is a data error. */
export const PLACE_VIEW_IDS = Object.freeze(Object.keys(PLACE_VIEWS) as PlaceViewId[]);

export function isPlaceViewId(value: string): value is PlaceViewId {
  return Object.hasOwn(PLACE_VIEWS, value);
}
