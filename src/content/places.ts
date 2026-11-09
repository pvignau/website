import type { PlaceId } from './types.ts';

/** A `Record` makes the compiler reject a missing or unknown place id. */
const PLACE_ORDER: Record<PlaceId, true> = { home: true, work: true, lab: true, contact: true };

/** Every place, in the order of the quest log and of the text version. */
export const PLACE_IDS = Object.freeze(Object.keys(PLACE_ORDER) as PlaceId[]);

export function isPlaceId(value: string): value is PlaceId {
  return Object.hasOwn(PLACE_ORDER, value);
}
