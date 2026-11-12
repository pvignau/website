/**
 * Single entry point for everything the visitor can read.
 *
 * `content` is the French portfolio copy (`./site`). `./site.placeholder`
 * keeps a neutral version with the same shape, handy for engine work.
 *
 * vite.config.ts loads this module too: its imports name their file in full,
 * as Node's own loader requires (Vite's native config loader).
 */
export { isNoteId, NOTE_IDS } from './notes.ts';
export { content } from './site.ts';
export { isPlaceId, isPlaceViewId, PLACE_IDS, PLACE_VIEW_IDS } from './places.ts';
export type * from './types.ts';
export { ui } from './ui.ts';
export type { UiCopy } from './ui.ts';
