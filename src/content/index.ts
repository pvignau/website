/**
 * Single entry point for everything the visitor can read.
 *
 * `COPIES` holds the copy of each language: French (`./site`, `./ui`) and
 * English (`./site.en`, `./ui.en`). `content` and `ui` are the French one.
 * `./site.placeholder` keeps a neutral version with the same shape, handy for
 * engine work.
 *
 * vite.config.ts loads this module too: its imports name their file in full,
 * as Node's own loader requires (Vite's native config loader).
 */
import type { Lang } from './languages.ts';
import { content } from './site.ts';
import { content as contentEn } from './site.en.ts';
import type { SiteContent } from './types.ts';
import type { UiCopy } from './ui.ts';
import { ui } from './ui.ts';
import { ui as uiEn } from './ui.en.ts';

export { DEFAULT_LANG, LANGS, LANGUAGES } from './languages.ts';
export type { Lang, Language } from './languages.ts';
export { isNoteId, NOTE_IDS } from './notes.ts';
export { isPlaceId, isPlaceViewId, PLACE_IDS, PLACE_VIEW_IDS } from './places.ts';
export type * from './types.ts';
export type { UiCopy } from './ui.ts';

/** Everything the visitor reads, in one language. */
export interface Copy {
  readonly lang: Lang;
  readonly content: SiteContent;
  readonly ui: UiCopy;
}

/** The copy of each language; the app reads the one of its page (src/app/copy.ts). */
export const COPIES: Readonly<Record<Lang, Copy>> = {
  fr: { lang: 'fr', content, ui },
  en: { lang: 'en', content: contentEn, ui: uiEn },
};

/** The French copy, the default: the build reads it by name, and so do tests. */
export { content, ui };
