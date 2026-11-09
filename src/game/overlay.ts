import type { PlaceId } from '../content';
import { isPlaceId } from '../content';

/**
 * What a history entry added by the game shows over it: a place, the help or
 * the text version. Opening one adds the entry, so the browser's Back (and
 * Android's back gesture) closes it instead of leaving the site.
 */
export type Overlay = PlaceId | 'help' | 'text';

export interface OverlayState {
  readonly overlay: Overlay;
}

/** The overlay of a history entry's state; anything else (null, a door's state) reads as none. */
export function overlayOf(state: unknown): Overlay | null {
  if (typeof state !== 'object' || state === null || !('overlay' in state)) return null;
  const { overlay } = state;
  if (overlay === 'help' || overlay === 'text') return overlay;
  return typeof overlay === 'string' && isPlaceId(overlay) ? overlay : null;
}

/** The place an overlay shows, if it is one. */
export function overlayPlace(overlay: Overlay | null): PlaceId | null {
  return overlay === null || overlay === 'help' || overlay === 'text' ? null : overlay;
}
