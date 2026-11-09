import { render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAPS } from '../game/maps';
import { Minimap } from './Minimap';

function worldMinimap() {
  const layout = MAPS.world.minimap;
  if (!layout) throw new Error('The world has a minimap.');
  return layout;
}

const layout = worldMinimap();

function setup({
  ready = false,
  shown = true,
  visited = [],
}: { ready?: boolean; shown?: boolean; visited?: ('home' | 'work' | 'lab' | 'contact')[] } = {}) {
  const heroRef = createRef<HTMLSpanElement>();
  const { container } = render(
    <Minimap
      layout={layout}
      image="/world.webp"
      background={MAPS.world.data.background}
      ready={ready}
      visited={visited}
      viewport={{ width: 1280, height: 720 }}
      shown={shown}
      heroRef={heroRef}
    />,
  );
  const root = container.querySelector<HTMLElement>('.minimap');
  if (!root) throw new Error('No minimap.');
  return { root, heroRef };
}

describe('Minimap', () => {
  it('is decorative: hidden from screen readers, which hear the HUD instead', () => {
    const { root } = setup();
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  it('marks the four places, filled once visited', () => {
    const { root } = setup({ visited: ['home', 'lab'] });
    const places = [...root.querySelectorAll<HTMLElement>('.minimap__place')];
    expect(places.map((place) => place.dataset.place).sort()).toEqual([
      'contact',
      'home',
      'lab',
      'work',
    ]);
    const visited = places.filter((place) => place.hasAttribute('data-visited'));
    expect(visited.map((place) => place.dataset.place).sort()).toEqual(['home', 'lab']);
  });

  it('draws the map in whole device pixels, at most two CSS pixels per pixel', () => {
    const { root } = setup();
    const canvas = root.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', String(layout.width));
    expect(canvas).toHaveAttribute('height', String(layout.height));
    // 1280 × 720 at one device pixel per CSS pixel: two CSS pixels per minimap pixel.
    const map = root.querySelector<HTMLElement>('.minimap__map');
    expect(map?.style.width).toBe(`${layout.width * 2}px`);
    expect(map?.style.height).toBe(`${layout.height * 2}px`);
  });

  it('gives the game loop the marker of the hero', () => {
    const { heroRef } = setup();
    expect(heroRef.current).toHaveClass('minimap__hero-layer');
  });

  it('folds away', () => {
    const { root } = setup({ shown: false });
    expect(root).not.toBeVisible();
  });
});

describe('Minimap drawing', () => {
  const drawImage = vi.fn();
  const createImageBitmap = vi.fn(
    (
      _image: unknown,
      _x: number,
      _y: number,
      _w: number,
      _h: number,
      options: ImageBitmapOptions,
    ) =>
      Promise.resolve({
        width: options.resizeWidth ?? 0,
        height: options.resizeHeight ?? 0,
        close: () => undefined,
      }),
  );
  beforeEach(() => {
    HTMLImageElement.prototype.decode = () => Promise.resolve();
    vi.stubGlobal('createImageBitmap', createImageBitmap);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () =>
        ({
          imageSmoothingEnabled: false,
          clearRect: () => undefined,
          drawImage,
        }) as unknown as CanvasRenderingContext2D,
    );
  });

  afterEach(() => {
    // @ts-expect-error -- jsdom has no decode(); remove the stand-in
    delete HTMLImageElement.prototype.decode;
    drawImage.mockReset();
    createImageBitmap.mockClear();
  });

  it('waits for the background before drawing', async () => {
    setup({ ready: false });
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(createImageBitmap).not.toHaveBeenCalled();
    expect(drawImage).not.toHaveBeenCalled();
  });

  it('crops the frame out of the decoded background, then halves it down to the minimap', async () => {
    setup({ ready: true });
    await waitFor(() => {
      // A first half in createImageBitmap, the other halvings on canvases.
      expect(drawImage).toHaveBeenCalledTimes(Math.log2(layout.blockSize) - 1);
    });
    const [picture, x, y, width, height, options] = createImageBitmap.mock.calls[0] ?? [];
    expect((picture as HTMLImageElement).src).toContain('/world.webp');
    const { background } = MAPS.world.data;
    expect([x, y, width, height]).toEqual([
      layout.frame.x - background.x,
      layout.frame.y - background.y,
      layout.frame.width,
      layout.frame.height,
    ]);
    expect(options).toEqual({
      resizeWidth: layout.frame.width / 2,
      resizeHeight: layout.frame.height / 2,
      resizeQuality: 'low',
    });
  });
});
