/** Languages of the site. French is the default: its pages have no prefix. */
export type Lang = 'fr' | 'en';

export interface Language {
  readonly lang: Lang;
  /** Prefix of its addresses: `''` for French (/home), `'/en'` for English (/en/home). */
  readonly prefix: '' | `/${string}`;
  /** Its name, in itself: what the switch to it says. */
  readonly name: string;
  /** Short form of the name, for narrow screens. */
  readonly short: string;
  /** Open Graph locale. */
  readonly locale: string;
}

/** A `Record` makes the compiler reject a missing or unknown language. */
export const LANGUAGES: Readonly<Record<Lang, Language>> = {
  fr: { lang: 'fr', prefix: '', name: 'Français', short: 'FR', locale: 'fr_FR' },
  en: { lang: 'en', prefix: '/en', name: 'English', short: 'EN', locale: 'en_GB' },
};

export const DEFAULT_LANG: Lang = 'fr';

/** Every language, the default first. */
export const LANGS = Object.freeze(Object.keys(LANGUAGES) as Lang[]);
