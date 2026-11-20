import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COPIES, content, ui } from '../content';
import { HERO } from '../engine/hero';
import { findSpawn } from '../engine/tiled';
import { HELP_SEEN_KEY, helpSeen } from '../game/helpSeen';
import { MAPS } from '../game/maps';
import { questStore } from '../quest/useQuest';
import { pageOf, PATHS } from './pages';
import { createBrowserHistory } from './history';
import { languageOf } from './language';
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
  // As main.tsx does: the page takes the language of its address.
  const lang = languageOf(window.location.pathname);
  render(<App history={createBrowserHistory(window, lang)} lang={lang} />);
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

  it('enters the house on /home, pointed to the desk', async () => {
    renderAt('/home');
    expect(await screen.findByRole('img', { name: ui.game.mapAlt.home })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
    const hint = content.places.home.questHint;
    if (hint === undefined) throw new Error('The house has no hint to its desk.');
    expect(screen.getByText(text(hint), { selector: '.hud__hint' })).toBeInTheDocument();
    // The quest step is the desk, not the door.
    expect(questStore.getSnapshot()).toEqual([]);
  });

  it('stops pointing to the desk once the house is ticked off', async () => {
    questStore.markVisited('home');
    renderAt('/home');
    await screen.findByRole('img', { name: ui.game.mapAlt.home });
    const hint = content.places.home.questHint;
    if (hint === undefined) throw new Error('The house has no hint to its desk.');
    expect(screen.queryByText(text(hint))).toBeNull();
  });

  it('ticks the house off in the quest at the desk', async () => {
    const office = content.places.home.views?.office;
    if (!office) throw new Error('The house has no office view.');
    renderAt('/home');
    await screen.findByRole('img', { name: ui.game.mapAlt.home });
    const state = { overlay: 'home', view: 'office' };
    window.history.pushState(state, '', '/home');
    window.dispatchEvent(new PopStateEvent('popstate', { state }));
    await screen.findByRole('dialog', { name: named(office.title) });
    expect(questStore.getSnapshot()).toEqual(['home']);
  });

  it('reopens the bio from the desk as the office tells it', async () => {
    const office = content.places.home.views?.office;
    if (!office) throw new Error('The house has no office view.');
    questStore.markVisited('home');
    renderAt('/home');
    // As the desk does: an entry of its own, which names the view.
    const state = { overlay: 'home', view: 'office' };
    window.history.pushState(state, '', '/home');
    window.dispatchEvent(new PopStateEvent('popstate', { state }));
    const dialog = await screen.findByRole('dialog', { name: named(office.title) });
    expect(within(dialog).getByText(text(office.lead))).toBeInTheDocument();
    expect(within(dialog).queryByText(/La porte grince/)).toBeNull();
    expect(document.title).toBe(ui.pageTitle(office.title));
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
    const work = pageOf(PATHS.work, 'fr');
    const world = pageOf(PATHS.world, 'fr');

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

  it('on a first visit through /work, shows the help once its dialog is closed', async () => {
    helpSeen.reset();
    renderAt('/work');
    const dialog = await screen.findByRole('dialog', { name: named(content.places.work.title) });
    expect(screen.queryByRole('dialog', { name: named(content.help.title) })).toBeNull();

    await userEvent.click(within(dialog).getByRole('button', { name: ui.dialog.close }));
    const help = await screen.findByRole('dialog', { name: named(content.help.title) });
    await userEvent.click(within(help).getByRole('button', { name: ui.help.start }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(helpSeen.get()).toBe(true);
  });

  it('on a first visit through /home, shows the help first, then the hint to the desk', async () => {
    helpSeen.reset();
    renderAt('/home');
    const help = await screen.findByRole('dialog', { name: named(content.help.title) });
    await userEvent.click(within(help).getByRole('button', { name: ui.help.start }));
    expect(screen.queryByRole('dialog')).toBeNull();
    const hint = content.places.home.questHint;
    if (hint === undefined) throw new Error('The house has no hint to its desk.');
    // Said once the visitor can walk, and shown in the HUD.
    expect(
      await screen.findByText(text(hint), { selector: '[role="status"] span' }),
    ).toBeInTheDocument();
  });

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

describe('the English pages', () => {
  const en = COPIES.en;

  it('point the visitor of /en/home to the desk, in English', async () => {
    renderAt('/en/home');
    await screen.findByRole('img', { name: en.ui.game.mapAlt.home });
    const hint = en.content.places.home.questHint;
    if (hint === undefined) throw new Error('The English house has no hint to its desk.');
    expect(screen.getByText(text(hint), { selector: '.hud__hint' })).toBeInTheDocument();
    expect(document.title).toBe(en.ui.pageTitle(en.content.places.home.zone));
  });

  it('open the projects on /en/work, and closing them stays in English, on /en', async () => {
    renderAt('/en/work');
    const dialog = await screen.findByRole('dialog', { name: named(en.content.places.work.title) });
    await userEvent.click(within(dialog).getByRole('button', { name: en.ui.dialog.close }));
    expect(window.location.pathname).toBe('/en');
    expect(screen.getByRole('img', { name: en.ui.game.mapAlt.world })).toBeInTheDocument();
  });

  it('keep the canonical URL and the links to each language in step', async () => {
    renderAt('/en/work');
    await screen.findByRole('dialog', { name: named(en.content.places.work.title) });
    const head = document.head;
    expect(head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://pyve.is-a.dev/en/work',
    );
    const alternates = Array.from(head.querySelectorAll('link[rel="alternate"][hreflang]')).map(
      (link) => `${link.getAttribute('hreflang') ?? ''} ${link.getAttribute('href') ?? ''}`,
    );
    expect(alternates).toEqual([
      'fr https://pyve.is-a.dev/work',
      'en https://pyve.is-a.dev/en/work',
      'x-default https://pyve.is-a.dev/work',
    ]);
  });

  it('show their own 404 page, with a way back to the English island', async () => {
    renderAt('/en/nowhere');
    await screen.findByRole('heading', { level: 1, name: named(en.content.notFound.title) });
    const back = screen.getByRole('link', { name: named(en.content.notFound.backLabel) });
    expect(back.getAttribute('href')).toBe('/en');
  });
});

describe('the language switch', () => {
  it('leads from a French page to the same page in English', async () => {
    renderAt('/home');
    await screen.findByRole('img', { name: ui.game.mapAlt.home });
    const link = screen.getByRole('link', { name: 'English' });
    expect(link.getAttribute('href')).toBe('/en/home');
    expect(link.getAttribute('hreflang')).toBe('en');
  });

  it('leads from an English page back to French', async () => {
    renderAt('/en?debug');
    await screen.findByRole('img', { name: COPIES.en.ui.game.mapAlt.world });
    expect(screen.getByRole('link', { name: 'Français' }).getAttribute('href')).toBe('/?debug');
  });
});
