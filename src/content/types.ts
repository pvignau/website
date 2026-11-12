/**
 * Content contract shared by the game engine and the portfolio copy.
 *
 * Everything the visitor can read lives in `src/content/` as typed data:
 * the engine renders it (dialogs, quest log, text version of the site) and
 * never hard-codes copy. Rich text is structured blocks, never raw HTML.
 */

/** Identifier of an interactive place on a map. */
export type PlaceId = 'home' | 'work' | 'lab' | 'contact';

/** Identifier of an object that says one sentence when inspected (a `note` object in Tiled). */
export type NoteId = 'tv' | 'console' | 'helmet';

/** Identifier of another way into a place's dialog (a `view` property on a `place` object in Tiled). */
export type PlaceViewId = 'office';

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
  /** Other ways into this dialog, from objects of the map that set the scene elsewhere. */
  views?: Partial<Record<PlaceViewId, PlaceView>>;
}

/**
 * A place's dialog opened from an object of its map rather than on arrival:
 * the house greets you at its door with the bio, and the desk of its office
 * reopens it. The view names the object, the zone and the dialog, and its lead
 * takes the place of the first paragraph, the one that sets the scene; the rest
 * of the body stays the place's own. The text version keeps the place as is.
 */
export interface PlaceView {
  /** Shown near the object (≤ 12 chars). */
  label: string;
  zone: string;
  title: string;
  lead: string;
}

/**
 * What an object of the map says when inspected: no dialog, no quest, one
 * sentence in the HUD. Not in the text version: the places say it all.
 */
export interface Note {
  /** Shown near the object (≤ 12 chars). */
  label: string;
  text: string;
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
  /** Objects of the house that say a word about Pyve. */
  notes: Record<NoteId, Note>;
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
