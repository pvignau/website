/**
 * Interface microcopy: what the engine itself says (controls, buttons,
 * accessible names). The portfolio copy lives in `SiteContent`; nothing
 * visible is hard-coded in components.
 *
 * Typography follows the content: straight apostrophes and a no-break space
 * (U+00A0) before ? ! : ;
 */
export interface UiCopy {
  /** Site name, used in page titles and Open Graph (public/manifest.json repeats it). */
  siteName: string;
  /** Title of a page: `pageTitle('Plouf !')`; `null` for the home page. */
  pageTitle: (page: string | null) => string;
  /** Alternative text of the Open Graph preview image (public/og-image.png). */
  ogImageAlt: string;
  skipLink: string;
  loading: string;
  /** Above the text version written in each page: shown without JavaScript, or when the game cannot start. */
  noscript: string;
  game: {
    /** Accessible name of the game area. */
    label: string;
    /** HUD zone when the hero is near nothing, on the outdoor map. */
    outdoorZone: string;
    /** Accessible description of each map background. */
    mapAlt: { world: string; home: string };
  };
  hud: {
    explore: { keyboard: string; touch: string };
    interact: { keyboard: (target: string) => string; touch: (target: string) => string };
    nothingHere: string;
  };
  /** Label of a door that leads back outside. */
  exitLabel: string;
  quest: {
    title: string;
    /** Shown: "2/4". */
    progress: (done: number, total: number) => string;
    /** Read out instead: "2/4" may be read as a fraction. */
    progressLabel: (done: number, total: number) => string;
    done: string;
    todo: string;
    complete: string;
  };
  toolbar: { label: string; help: string; helpShortcut: string };
  dialog: { close: string; newTab: string };
  help: { start: string };
  textVersion: { close: string };
  touch: {
    label: string;
    /** Accessible name of the action button: it starts with the visible letter (WCAG 2.5.3). */
    action: string;
    /** Visible letter on the action button, the "A" of the touch hint. */
    actionKey: string;
  };
  error: { title: string; body: string; backLabel: string };
}

const siteName = 'Le monde de Pyve';
/** Completes the site name in the home page title. */
const tagline = 'portfolio et expériences interactives';

export const ui: UiCopy = {
  siteName,
  pageTitle: (page) => (page === null ? `${siteName} : ${tagline}` : `${page} · ${siteName}`),
  ogImageAlt: 'En pixel art, le héros marche sur le ponton entre la maison et le bateau.',
  skipLink: 'Aller à la version texte',
  loading: "Chargement de l'île…",
  noscript:
    "Ce portfolio se visite d'habitude comme un petit jeu, qui a besoin de JavaScript pour se lancer. Le voici en version texte :",
  game: {
    label: 'Le jeu',
    outdoorZone: "Sur l'île",
    mapAlt: {
      world:
        'Deux îles en pixel art reliées par un pont : une maison, un atelier, son annexe devenue le lab IA sous une enseigne au néon, et un ponton où attend un bateau.',
      home: 'Intérieur de la maison : un salon avec un canapé face à la télé, une bibliothèque et des plantes, une chambre avec un lit et un bureau à deux écrans.',
    },
  },
  hud: {
    explore: { keyboard: 'Flèches ou ZQSD : marcher', touch: 'Croix : marcher' },
    interact: {
      keyboard: (target) => `Espace ou Entrée : ${target}`,
      touch: (target) => `Bouton A : ${target}`,
    },
    nothingHere: 'Rien à inspecter ici.',
  },
  exitLabel: 'Sortir',
  quest: {
    title: 'Quête',
    progress: (done, total) => `${done}/${total}`,
    progressLabel: (done, total) => `${done} sur ${total}`,
    done: 'fait',
    todo: 'à faire',
    complete: 'Quête terminée : merci de ta visite !',
  },
  toolbar: { label: 'Menu du jeu', help: 'Aide', helpShortcut: '?' },
  dialog: { close: 'Fermer', newTab: '(nouvel onglet)' },
  help: { start: 'Jouer' },
  textVersion: { close: 'Retour au jeu' },
  touch: {
    label: 'Commandes tactiles',
    action: 'A : interagir',
    actionKey: 'A',
  },
  error: {
    title: 'Le jeu a planté',
    body: "Une erreur inattendue s'est produite. Recharge la page, ou repars du début.",
    backLabel: 'Repartir du début',
  },
};
