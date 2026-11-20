/** Public profiles, shared by every language of the copy. */
export const GITHUB = 'https://github.com/pvignau';
export const LINKEDIN = 'https://www.linkedin.com/in/pierre-yves-vignau-a99a9424/';

/** Profiles that are Pyve's own: their links carry `rel="me"`. */
export const PROFILES: readonly string[] = [GITHUB, LINKEDIN];

/** Who the site is about, for search engines (schema.org `Person`). */
export const PERSON = {
  name: 'Pierre-Yves Vignau',
  alternateName: 'Pyve',
  jobTitle: 'Software architect',
  worksFor: 'France Télévisions',
  sameAs: PROFILES,
} as const;
