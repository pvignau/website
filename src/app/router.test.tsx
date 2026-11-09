import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { content, ui } from '../content';
import { HERO } from '../engine/hero';
import { findSpawn } from '../engine/tiled';
import { HELP_SEEN_KEY, helpSeen } from '../game/helpSeen';
import { MAPS } from '../game/maps';
import { questStore } from '../quest/useQuest';
import { pageOf, PATHS } from './pages';
import { createBrowserHistory } from './history';
import { normalizeLocation } from './location';
import { App } from './router';
import { RouteError } from './RouteError';

/**
 * The copy puts no-break spaces (U+00A0) before "!" or ":". Testing Library collapses
 * them in text queries but keeps them in accessible names: compare both normalised.
 */
const text = (copy: string) => copy.replace(/\s+/g, ' ').trim();
const named = (copy: string) => (name: string) => text(name) === text(copy);

/**
 * Opens the app at an address of jsdom's window, as main.tsx does. `raw` skips
 * the rewrite of the address, as when a sandboxed frame refuses it.
 */
function renderAt(path: string, { raw = false } = {}) {
  window.history.replaceState(null, '', path);
  if (!raw) normalizeLocation(window.location, window.history);
  render(<App history={createBrowserHistory(window)} />);
}

beforeEach(() => {
  questStore.reset();
  // Returning visitor: the help screen does not get in the way.
  helpSeen.mark();
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

/** Where the hero's sprite is drawn (scale 1 in jsdom, which has no layout). */
function heroTransform(): string | undefined {
  return document.querySelector<HTMLElement>('.hero')?.style.transform;
}

describe('routes', () => {
  it('shows the in-game 404 page for an unknown path, with a way back', async () => {
    renderAt('/nowhere/at/all');
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: named(content.notFound.title),
    });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(text(content.notFound.body))).toBeInTheDocument();
    expect(document.title).toBe(ui.pageTitle(content.notFound.title));

    await userEvent.click(screen.getByRole('link', { name: named(content.notFound.backLabel) }));
    expect(window.location.pathname).toBe('/');
  });

  it('opens /work on the world map with the projects dialog, and closing it goes back to /', async () => {
    renderAt('/work');
    const dialog = await screen.findByRole('dialog', { name: named(content.places.work.title) });
    expect(document.title).toBe(ui.pageTitle(content.places.work.title));
    expect(screen.getByRole('img', { name: ui.game.mapAlt.world })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: ui.dialog.close }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(window.location.pathname).toBe('/');
    // Opening the projects counted for the quest.
    expect(questStore.getSnapshot()).toEqual(['work']);
  });

  it('also opens the projects on /work/, as served by 404.html, next to the panel', async () => {
    renderAt('/work/', { raw: true });
    await screen.findByRole('dialog', { name: named(content.places.work.title) });
    const { x, y } = findSpawn(MAPS.world.data, '/work').position;
    expect(heroTransform()).toBe(`translate3d(${x - HERO.anchor.x}px, ${y - HERO.anchor.y}px, 0)`);
  });

  it('enters the house on /home, greeted by the bio on the first visit', async () => {
    renderAt('/home');
    expect(
      await screen.findByRole('dialog', { name: named(content.places.home.title) }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: ui.game.mapAlt.home })).toBeInTheDocument();
  });

  it('opens the help screen on the very first visit only', async () => {
    helpSeen.reset();
    renderAt('/');
    const help = await screen.findByRole('dialog', { name: named(content.help.title) });
    await userEvent.click(within(help).getByRole('button', { name: ui.help.start }));
    expect(window.localStorage.getItem(HELP_SEEN_KEY)).toBe('1');
  });

  it('keeps the canonical URL and the description in step with the page shown', async () => {
    const canonical = () =>
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');
    const description = () =>
      document.head.querySelector('meta[name="description"]')?.getAttribute('content');
    const work = pageOf(PATHS.work);
    const world = pageOf(PATHS.world);

    renderAt('/work');
    const dialog = await screen.findByRole('dialog', { name: named(content.places.work.title) });
    expect(canonical()).toBe('https://pyve.is-a.dev/work');
    expect(description()).toBe(work?.description);

    await userEvent.click(within(dialog).getByRole('button', { name: ui.dialog.close }));
    expect(canonical()).toBe('https://pyve.is-a.dev/');
    expect(description()).toBe(world?.description);
    cleanup();

    renderAt('/nowhere');
    await screen.findByRole('heading', { level: 1, name: named(content.notFound.title) });
    expect(canonical()).toBeUndefined();
  });

  it('tells screen readers what the hero comes near, and every time a key finds nothing', async () => {
    renderAt('/work');
    const dialog = await screen.findByRole('dialog', { name: named(content.places.work.title) });
    await userEvent.click(within(dialog).getByRole('button', { name: ui.dialog.close }));
    // The HUD itself is no live region; one status line speaks for it.
    const status = screen.getByRole('status');
    expect(document.querySelector('.hud')).not.toHaveAttribute('role');
    // The /work spawn stands next to the projects.
    expect(text(status.textContent)).toBe(
      text(`${content.places.work.zone}. ${ui.hud.interact.keyboard(content.places.work.label)}`),
    );
    cleanup();

    renderAt('/');
    await screen.findByRole('img', { name: ui.game.mapAlt.world });
    const line = screen.getByRole('status');
    expect(line).toHaveTextContent('');
    await userEvent.keyboard(' ');
    const first = line.firstElementChild;
    expect(first).toHaveTextContent(text(ui.hud.nothingHere));
    await userEvent.keyboard(' ');
    // Same words, new node: screen readers say them again.
    expect(line.firstElementChild).toHaveTextContent(text(ui.hud.nothingHere));
    expect(line.firstElementChild).not.toBe(first);
  });

  it('names the toolbar buttons, even where they only show an icon', async () => {
    renderAt('/');
    const toolbar = await screen.findByRole('group', { name: ui.toolbar.label });
    expect(within(toolbar).getByRole('button', { name: ui.toolbar.help })).toBeInTheDocument();
    expect(
      within(toolbar).getByRole('button', { name: content.help.textVersionLabel }),
    ).toBeInTheDocument();
  });

  it.each([
    ['/work', content.places.work.title],
    ['/home', content.places.home.title],
  ])(
    'on a first visit through %s, shows the help once its dialog is closed',
    async (path, title) => {
      helpSeen.reset();
      renderAt(path);
      const dialog = await screen.findByRole('dialog', { name: named(title) });
      expect(screen.queryByRole('dialog', { name: named(content.help.title) })).toBeNull();

      await userEvent.click(within(dialog).getByRole('button', { name: ui.dialog.close }));
      const help = await screen.findByRole('dialog', { name: named(content.help.title) });
      await userEvent.click(within(help).getByRole('button', { name: ui.help.start }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(helpSeen.get()).toBe(true);
    },
  );

  it('keeps the whole portfolio in the DOM, in the main landmark of game screens', async () => {
    renderAt('/');
    const main = await screen.findByRole('main');
    const article = within(main).getByRole('article', { name: named(content.name) });
    expect(within(article).getAllByRole('heading', { level: 2 })).toHaveLength(4);
    expect(within(main).getByRole('region', { name: ui.game.label })).toBeInTheDocument();
  });
});

describe('history entries of dialogs', () => {
  /** Opens /work, closes the projects (back to /), and leaves the hero next to the panel. */
  async function nextToThePanel() {
    renderAt('/work');
    const dialog = await screen.findByRole('dialog', { name: named(content.places.work.title) });
    await userEvent.click(within(dialog).getByRole('button', { name: ui.dialog.close }));
    // A deep link: closing rewrites /work to / without adding an entry.
    expect(window.location.pathname).toBe('/');
    expect(window.history.state).toBeNull();
  }

  it("adds an entry when the player opens a place: the browser's Back closes it", async () => {
    await nextToThePanel();
    const length = window.history.length;
    await userEvent.keyboard(' ');
    await screen.findByRole('dialog', { name: named(content.places.work.title) });
    expect(window.location.pathname).toBe('/work');
    expect(window.history.length).toBe(length + 1);

    window.history.back();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(window.location.pathname).toBe('/');
    // Still the world screen, the hero where he was.
    expect(screen.getByRole('img', { name: ui.game.mapAlt.world })).toBeInTheDocument();
  });

  it('takes the entry off when the dialog is closed, so Back then leaves the game', async () => {
    await nextToThePanel();
    await userEvent.keyboard(' ');
    const dialog = await screen.findByRole('dialog', { name: named(content.places.work.title) });
    await userEvent.click(within(dialog).getByRole('button', { name: ui.dialog.close }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(window.location.pathname).toBe('/');
    expect(window.history.state).toBeNull();
  });

  it('gives the help asked with "?" an entry of its own', async () => {
    renderAt('/');
    await screen.findByRole('img', { name: ui.game.mapAlt.world });
    await userEvent.keyboard('?');
    const help = await screen.findByRole('dialog', { name: named(content.help.title) });
    expect(window.history.state).toEqual({ overlay: 'help' });

    await userEvent.click(within(help).getByRole('button', { name: ui.help.start }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(window.history.state).toBeNull();
  });

  it("lets the text version opened from the help take the help's entry", async () => {
    renderAt('/');
    await screen.findByRole('img', { name: ui.game.mapAlt.world });
    await userEvent.keyboard('?');
    const help = await screen.findByRole('dialog', { name: named(content.help.title) });
    await userEvent.click(
      within(help).getByRole('button', { name: content.help.textVersionLabel }),
    );
    expect(window.history.state).toEqual({ overlay: 'text' });
    // The help, gone, does not take the text version's entry off on its way out.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(window.history.state).toEqual({ overlay: 'text' });
    expect(document.querySelector('.text-version--open')).not.toBeNull();

    // One Back: from the text version straight to the game, not to the help.
    window.history.back();
    await waitFor(() => {
      expect(window.history.state).toBeNull();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('error boundary', () => {
  function Boom(): never {
    throw new Error('kaboom');
  }

  it('replaces a crash with a page in the game style', () => {
    // React reports the caught error on the console.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <RouteError>
        <Boom />
      </RouteError>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: named(ui.error.title) }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/kaboom/)).toBeNull();
    expect(screen.getByRole('link', { name: named(ui.error.backLabel) })).toHaveAttribute(
      'href',
      '/',
    );
  });
});

describe('addresses', () => {
  it.each([
    ['/index.html', '/', ui.game.mapAlt.world],
    ['/home.html', '/home', ui.game.mapAlt.home],
    ['/work.html', '/work', ui.game.mapAlt.world],
    ['/#/home', '/home', ui.game.mapAlt.home],
  ])('shows %s as %s', async (url, pathname, mapAlt) => {
    renderAt(url);
    expect(await screen.findByRole('img', { name: mapAlt })).toBeInTheDocument();
    expect(window.location.pathname).toBe(pathname);
  });

  it('starts on the world map despite a crafted legacy hash', async () => {
    renderAt('/#//evil.example/x');
    expect(await screen.findByRole('img', { name: ui.game.mapAlt.world })).toBeInTheDocument();
    expect(window.location.host).toBe('localhost:3000');
  });
});
