import type { NoteId } from './types.ts';

/** A `Record` makes the compiler reject a missing or unknown note id. */
const NOTES: Record<NoteId, true> = { tv: true, console: true, helmet: true };

/** Every note, for the map parser: a `note` object with another name is a data error. */
export const NOTE_IDS = Object.freeze(Object.keys(NOTES) as NoteId[]);

export function isNoteId(value: string): value is NoteId {
  return Object.hasOwn(NOTES, value);
}
