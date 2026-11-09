/**
 * Content contract shared by the game engine and the portfolio copy.
 *
 * Everything the visitor can read lives in `src/content/` as typed data:
 * the engine renders it (dialogs, quest log, text version of the site) and
 * never hard-codes copy. Rich text is structured blocks, never raw HTML.
 */

/** Identifier of an interactive place on a map. */
export type PlaceId = 'home' | 'work' | 'lab' | 'contact';

export interface Link {
  label: string;
  href: string;
}

export type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'projects'; items: Project[] };

export interface Project {
  name: string;
  /** One sentence: what it is and why it matters. */
  summary: string;
  /** Short tags, e.g. "TypeScript", "Figma", "Home Assistant". */
  tags: string[];
  links: Link[];
}

export interface Place {
  id: PlaceId;
  /** Short label shown near the object in the world (≤ 12 chars). */
  label: string;
  /** Zone name shown in the HUD when the player is close. */
  zone: string;
  /** Dialog title. */
  title: string;
  body: ContentBlock[];
  links: Link[];
  /** Quest log entry, phrased as an objective ("Entrer dans la maison"). */
  quest: string;
  /**
   * Meta description of the place's own page, for a place with a route (/home,
   * /work): what search results show under the title, 160 characters at most.
   */
  description?: string;
}

export interface SiteContent {
  /** Display name, e.g. "Pyve". */
  name: string;
  /** One-line role, e.g. "Développeur front-end & design systems". */
  role: string;
  /** Two or three sentences, used in the text version, the help screen and without JavaScript. */
  pitch: string;
  /** Meta description of the home page (search results), 160 characters at most. */
  description: string;
  places: Record<PlaceId, Place>;
  /** Onboarding / "how to play" screen. */
  help: {
    title: string;
    steps: string[];
    textVersionLabel: string;
  };
  /** 404 page copy. */
  notFound: {
    title: string;
    body: string;
    backLabel: string;
  };
}
