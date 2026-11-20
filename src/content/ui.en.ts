import type { UiCopy } from './ui.ts';

/** Interface microcopy in English: a translation of ./ui.ts. */

const siteName = "Pyve's world";
/** Completes the site name in the home page title. */
const tagline = 'portfolio and interactive experiments';

export const ui: UiCopy = {
  siteName,
  pageTitle: (page) => (page === null ? `${siteName}: ${tagline}` : `${page} · ${siteName}`),
  ogImageAlt:
    'In pixel art, the hero on the path in front of his house, the bridge to the other island and a boat at the quay.',
  skipLink: 'Skip to the text version',
  loading: 'Loading the island…',
  noscript:
    'This portfolio is usually visited as a small game, which needs JavaScript to start. Here it is as text:',
  game: {
    label: 'The game',
    outdoorZone: 'On the island',
    mapAlt: {
      world:
        'Two pixel-art islands joined by a bridge: a house, a workshop, its annex turned AI lab under a neon sign, and a jetty where a boat waits.',
      home: 'Inside the house: an entrance, a living room with a sofa facing the TV, a corridor, two colourful bedrooms, a bedroom with a double bed and an office for coding and gaming.',
    },
  },
  hud: {
    explore: { keyboard: 'Arrows or WASD: walk', touch: 'Pad: walk' },
    interact: {
      keyboard: (target) => `Space or Enter: ${target}`,
      touch: (target) => `A button: ${target}`,
    },
    nothingHere: 'Nothing to inspect here.',
  },
  exitLabel: 'Go out',
  quest: {
    title: 'Quest',
    progress: (done, total) => `${done}/${total}`,
    progressLabel: (done, total) => `${done} of ${total}`,
    done: 'done',
    todo: 'to do',
    complete: 'Quest complete: thanks for visiting!',
  },
  toolbar: { label: 'Game menu', help: 'Help', helpShortcut: '?' },
  mapControls: {
    label: 'Map',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomInShortcut: 'Plus',
    zoomOutShortcut: '-',
    minimap: 'Minimap',
  },
  dialog: { close: 'Close', newTab: '(new tab)' },
  help: { start: 'Play' },
  textVersion: { close: 'Back to the game' },
  touch: {
    label: 'Touch controls',
    action: 'A: interact',
    actionKey: 'A',
  },
  error: {
    title: 'The game crashed',
    body: 'Something unexpected went wrong. Reload the page, or start over.',
    backLabel: 'Start over',
  },
};
