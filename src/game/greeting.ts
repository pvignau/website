import type { PlaceId } from '../content';

/**
 * Places that greeted the visitor during this page load. The house greets on
 * arrival until its desk ticks it off in the quest, but once per visit: walking
 * out and back in does not show the bio again.
 */
const greeted = new Set<PlaceId>();

export const greeting = {
  shown: (place: PlaceId): boolean => greeted.has(place),
  mark: (place: PlaceId): void => {
    greeted.add(place);
  },
  /** A new visit (tests). */
  reset: (): void => {
    greeted.clear();
  },
};
