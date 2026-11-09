import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBrowserHistory } from '../app/history';
import { normalizeLocation } from '../app/location';
import { App } from '../app/router';
import { ui } from '../content';
import { computeCamera } from '../engine/camera';
import { HERO } from '../engine/hero';
import { findSpawn } from '../engine/tiled';
import { questStore } from '../quest/useQuest';
import { helpSeen } from './helpSeen';
import { MAPS } from './maps';
import { ZOOM_KEY } from './preferences';

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
