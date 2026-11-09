import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBrowserHistory } from '../app/history';
import { normalizeLocation } from '../app/location';
import { App } from '../app/router';
import { ui } from '../content';
import { computeCamera } from '../engine/camera';
import { HERO } from '../engine/hero';
import { projectToMinimap } from '../engine/minimap';
import { findSpawn } from '../engine/tiled';
import { questStore } from '../quest/useQuest';
import { helpSeen } from './helpSeen';
import { MAPS } from './maps';
import { MINIMAP_KEY, ZOOM_KEY } from './preferences';

/** jsdom has no layout: every box measures as a 1280 × 720 screen, two CSS pixels per map pixel. */
const VIEWPORT = { width: 1280, height: 720 };

function renderAt(path: string) {
  window.history.replaceState(null, '', path);
  normalizeLocation(window.location, window.history);
  render(<App history={createBrowserHistory(window)} />);
}

beforeEach(() => {
  questStore.reset();
  helpSeen.mark();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, VIEWPORT.width, VIEWPORT.height),
  );
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

/** CSS pixels per map pixel, as the world view is drawn. */
const scale = () =>
  Number(document.querySelector<HTMLElement>('.world')?.style.getPropertyValue('--s'));
const zoomIn = () => screen.getByRole('button', { name: ui.mapControls.zoomIn });
const zoomOut = () => screen.getByRole('button', { name: ui.mapControls.zoomOut });

async function openWorld() {
  renderAt('/');
  await screen.findByRole('img', { name: ui.game.mapAlt.world });
}

describe('zoom', () => {
  it('steps in with + and out with -, within its range', async () => {
    await openWorld();
    expect(scale()).toBe(2);

    await userEvent.keyboard('+');
    expect(scale()).toBe(3);
    await userEvent.keyboard('=');
    expect(scale()).toBe(4);
    expect(zoomIn()).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('+');
    expect(scale()).toBe(4);

    await userEvent.keyboard('---');
    expect(scale()).toBe(1);
    expect(zoomOut()).toHaveAttribute('aria-disabled', 'true');
    expect(zoomIn()).not.toHaveAttribute('aria-disabled');
  });

  it('keeps the hero in the middle, the camera within the map', async () => {
    await openWorld();
    const transform = () => document.querySelector<HTMLElement>('.world')?.style.transform;
    const { position } = findSpawn(MAPS.world.data, null);
    const focus = { x: position.x, y: position.y - HERO.sprite.height / 2 };
    for (const [key, expected] of [
      ['+', 3],
      ['+', 4],
      ['-', 3],
      ['-', 2],
      ['-', 1],
    ] as const) {
      await userEvent.keyboard(key);
      expect(scale()).toBe(expected);
      const camera = computeCamera(focus, VIEWPORT, MAPS.world.data, expected);
      expect(transform()).toBe(`translate3d(${camera.x}px, ${camera.y}px, 0)`);
    }
  });

  it('works with the buttons', async () => {
    await openWorld();
    await userEvent.click(zoomIn());
    expect(scale()).toBe(3);
    await userEvent.click(zoomOut());
    await userEvent.click(zoomOut());
    expect(scale()).toBe(1);
  });

  it('takes one step per turn of the wheel, and leaves a pinch to the browser', async () => {
    await openWorld();
    const map = screen.getByRole('region', { name: ui.game.label });
    fireEvent.wheel(map, { deltaY: -100 });
    expect(scale()).toBe(3);
    // Same gesture: no second step.
    fireEvent.wheel(map, { deltaY: -100 });
    expect(scale()).toBe(3);
    fireEvent.wheel(map, { deltaY: 100, ctrlKey: true });
    expect(scale()).toBe(3);
  });

  it('leaves Ctrl and +, the zoom of the browser, alone', async () => {
    await openWorld();
    await userEvent.keyboard('{Control>}+{/Control}');
    expect(scale()).toBe(2);
  });

  it('ignores the keys while a dialog is open', async () => {
    await openWorld();
    await userEvent.keyboard('?');
    await screen.findByRole('dialog');
    await userEvent.keyboard('+');
    expect(scale()).toBe(2);
  });

  it('is remembered, from one map to the other and between visits', async () => {
    await openWorld();
    await userEvent.keyboard('+');
    expect(window.localStorage.getItem(ZOOM_KEY)).toBe('1.5');
    cleanup();

    renderAt('/home');
    await screen.findByRole('img', { name: ui.game.mapAlt.home });
    expect(scale()).toBe(3);
  });

  it('starts from the default framing when the stored level is unknown', async () => {
    window.localStorage.setItem(ZOOM_KEY, '9');
    await openWorld();
    expect(scale()).toBe(2);
  });
});

describe('minimap', () => {
  const minimap = () => document.querySelector<HTMLElement>('.minimap');
  const toggle = () => screen.getByRole('button', { name: ui.mapControls.minimap });

  it('folds and unfolds with its button, and is remembered', async () => {
    // jsdom matches no media query: the screen counts as too short, the minimap starts folded.
    await openWorld();
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
    expect(minimap()).not.toBeVisible();

    await userEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
    expect(minimap()).toBeVisible();
    expect(window.localStorage.getItem(MINIMAP_KEY)).toBe('shown');
    cleanup();

    await openWorld();
    expect(minimap()).toBeVisible();
  });

  it('sits with the zoom buttons, out of the reach of screen readers', async () => {
    window.localStorage.setItem(MINIMAP_KEY, 'shown');
    await openWorld();
    const group = screen.getByRole('group', { name: ui.mapControls.label });
    expect(within(group).getAllByRole('button')).toHaveLength(3);
    expect(minimap()).toHaveAttribute('aria-hidden', 'true');
  });

  it('puts the hero where he stands, and ticks off the place he visits', async () => {
    window.localStorage.setItem(MINIMAP_KEY, 'shown');
    renderAt('/work');
    await screen.findByRole('dialog');
    const layout = MAPS.world.minimap;
    if (!layout) throw new Error('The world has a minimap.');
    const { x, y } = projectToMinimap(findSpawn(MAPS.world.data, '/work').position, layout);
    const marker = document.querySelector<HTMLElement>('.minimap__hero-layer');
    expect(marker?.style.transform).toBe(
      `translate(${((x + 0.5) / layout.width) * 100}%, ${((y + 0.5) / layout.height) * 100}%)`,
    );
    const work = document.querySelector('.minimap__place[data-place="work"]');
    expect(work).toHaveAttribute('data-visited');
    expect(document.querySelectorAll('.minimap__place[data-visited]')).toHaveLength(1);
  });

  it('is left out of the house, where the zoom buttons stay', async () => {
    window.localStorage.setItem(MINIMAP_KEY, 'shown');
    renderAt('/home');
    await screen.findByRole('img', { name: ui.game.mapAlt.home });
    expect(minimap()).toBeNull();
    expect(screen.queryByRole('button', { name: ui.mapControls.minimap })).toBeNull();
    expect(zoomIn()).toBeInTheDocument();
  });
});
