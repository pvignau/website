import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { TiledMap } from './build.ts';
import { backgroundRect, printMap } from './build.ts';
import type { Rgb, Swatch } from './comic.ts';
import {
  BLUE,
  COLOURS,
  CYAN,
  GUIDE,
  hex,
  INK,
  MAGENTA,
  nearest,
  overprint,
  PAPER,
  PAPER_SHADE,
  printComic,
  RED,
  rgb,
  SCREEN_PERIOD,
  SCREENS,
  seen,
  separation,
  SHADOW,
  TINTS,
  YELLOW,
} from './comic.ts';
import type { Image } from './image.ts';
import { createImage } from './image.ts';
import { decodePng } from './png.ts';
import { SPRITES } from './sprites.ts';

const read = (path: string) => readFileSync(new URL(path, import.meta.url));

/** An image from rows of characters, each standing for a colour. */
function picture(rows: string[], colours: Record<string, string>): Image {
  const image = createImage(rows[0]?.length ?? 0, rows.length);
  rows.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      const colour = colours[char];
      if (colour !== undefined) image.data.set([...rgb(colour), 255], (y * image.width + x) * 4);
    });
  });
  return image;
}

function pixel(image: Image, x: number, y: number): string {
  const at = (y * image.width + x) * 4;
  return hex([image.data[at] ?? 0, image.data[at + 1] ?? 0, image.data[at + 2] ?? 0]);
}

/** The colour a swatch prints at art pixel (x, y) of the map. */
const printed = ({ ink, dots }: Swatch, x: number, y: number): string =>
  hex(dots?.screen(x, y) ? dots.ink : ink);

const GRASS = '#74c857';
const SEA = '#67e6d2';
const SAND = '#f8c984';
const WOOD = '#d38658';

describe('the colour guide', () => {
  it('prints with the inks of the interface', () => {
    expect([PAPER, PAPER_SHADE, INK, RED, YELLOW, BLUE, CYAN, MAGENTA].map(hex)).toEqual([
      '#f6ecd2',
      '#e8d9b0',
      '#14110f',
      '#d7262e',
      '#ffd53d',
      '#1e5aa8',
      '#2fa8d8',
      '#d9417f',
    ]);
  });

  it('makes its tints of process inks over paper', () => {
    expect(overprint({})).toEqual(PAPER);
    expect(overprint({ c: 1 })).toEqual(CYAN);
    expect(overprint({ y: 1 })).toEqual(YELLOW);
    // Cyan over yellow: the green of comic books.
    expect(hex(overprint({ c: 1, y: 1 }))).toBe('#31973f');
    // Half the paper covered: lighter than the ink, darker than the paper.
    const [half] = overprint({ m: 0.5 });
    expect(half).toBeLessThan(PAPER[0]);
    expect(half).toBeGreaterThan(MAGENTA[0]);
  });

  it('repeats every screen after a period that divides the minimap blocks and the sea tile', () => {
    expect(8 % SCREEN_PERIOD).toBe(0);
    expect(64 % SCREEN_PERIOD).toBe(0);
    for (const screen of Object.values(SCREENS)) {
      for (let y = 0; y < 2 * SCREEN_PERIOD; y += 1) {
        for (let x = 0; x < 2 * SCREEN_PERIOD; x += 1) {
          expect(screen(x + SCREEN_PERIOD, y)).toBe(screen(x, y));
          expect(screen(x, y + SCREEN_PERIOD)).toBe(screen(x, y));
        }
      }
    }
  });

  it('gives sprites its flat colours by name', () => {
    expect(COLOURS.ink).toBe('#14110f');
    expect(COLOURS.green).toBe(hex(TINTS.green));
    expect(Object.keys(COLOURS)).not.toContain('sea');
  });

  it('sees a screen from afar as the mean of its inks', () => {
    expect(seen(GUIDE.paper)).toEqual(PAPER);
    const sea = seen(GUIDE.sea);
    // One dot of blue in eight, over cyan.
    expect(sea[2]).toBeLessThan(CYAN[2]);
    expect(sea[2]).toBeGreaterThan(BLUE[2]);
  });

  it('separates every colour of the art, and sprites use the guide', () => {
    for (const file of ['./world.png', './home.png', './sea.png', './hero.png']) {
      const art = decodePng(read(file));
      const unknown = new Set<string>();
      for (let i = 0; i < art.width * art.height; i += 1) {
        if (art.data[i * 4 + 3] === 0) continue;
        const colour: Rgb = [
          art.data[i * 4] ?? 0,
          art.data[i * 4 + 1] ?? 0,
          art.data[i * 4 + 2] ?? 0,
        ];
        if (separation(colour) === undefined) unknown.add(hex(colour));
      }
      expect([...unknown], file).toEqual([]);
    }
    const guide = new Set([...Object.values(COLOURS), SHADOW]);
    for (const [name, sprite] of Object.entries(SPRITES)) {
      for (let i = 0; i < sprite.width * sprite.height; i += 1) {
        const alpha = sprite.data[i * 4 + 3] ?? 0;
        if (alpha === 0) continue;
        const colour = `${pixel(sprite, i % sprite.width, Math.floor(i / sprite.width))}${alpha === 255 ? '' : alpha.toString(16).padStart(2, '0')}`;
        expect(guide.has(colour), `${name}: ${colour}`).toBe(true);
      }
    }
  });

  it('prints a colour it does not know with the nearest flat colour', () => {
    expect(nearest(rgb('#000000'))).toBe('ink');
    expect(nearest(rgb('#fffef0'))).toBe('paper');
    expect(nearest(rgb('#ff0000'))).toBe('red');
  });
});

describe('printComic', () => {
  const origin = { x: 0, y: 0 };

  it('outlines in ink what stands on the ground', () => {
    const rows = Array.from({ length: 20 }, (_, y) =>
      Array.from({ length: 20 }, (_, x) => (x >= 8 && x < 12 && y >= 8 && y < 12 ? 'w' : 'g')).join(
        '',
      ),
    );
    const out = printComic(picture(rows, { g: GRASS, w: WOOD }), origin);
    expect(pixel(out, 8, 8)).toBe(hex(INK));
    expect(pixel(out, 11, 10)).toBe(hex(INK));
    expect(pixel(out, 9, 9)).toBe(hex(TINTS.wood));
    expect(pixel(out, 7, 8)).toBe(hex(TINTS.green));
  });

  it('draws an ink line where land meets water, and prints the sea with dots', () => {
    const rows = Array.from({ length: 20 }, () => 'g'.repeat(10) + 's'.repeat(10));
    const out = printComic(picture(rows, { g: GRASS, s: SEA }), origin);
    expect(pixel(out, 9, 4)).toBe(hex(INK));
    expect(pixel(out, 8, 4)).toBe(hex(TINTS.green));
    for (let x = 10; x < 20; x += 1) expect(pixel(out, x, 4)).toBe(printed(GUIDE.sea, x, 4));
  });

  it('prints a small patch of a ground colour inside something as part of it', () => {
    const rows = Array.from({ length: 24 }, (_, y) =>
      Array.from({ length: 24 }, (_, x) => {
        if (x === 12 && y === 12) return 'd';
        return x >= 8 && x < 16 && y >= 8 && y < 16 ? 'w' : 'g';
      }).join(''),
    );
    const out = printComic(picture(rows, { g: GRASS, w: WOOD, d: SAND }), origin);
    // The sand of the path, lighting a plank: no outline, the yellow of the sand.
    expect(pixel(out, 12, 12)).toBe(hex(YELLOW));
    expect(pixel(out, 11, 12)).toBe(hex(TINTS.wood));
  });

  it('anchors screens to the map, not to the image', () => {
    const sea = picture(
      Array.from({ length: 16 }, () => 's'.repeat(16)),
      { s: SEA },
    );
    const at = (x: number) => printComic(sea, { x, y: 0 }).data;
    expect(at(SCREEN_PERIOD)).toEqual(at(0));
    expect(at(1)).not.toEqual(at(0));
  });

  it('hatches the shadows that sprites cast, and keeps transparency', () => {
    const rows = Array.from({ length: 20 }, () => '.' + 'f'.repeat(19));
    const floor = picture(rows, { f: '#a8906c' });
    const shadows = createImage(20, 20);
    for (let i = 0; i < 20 * 20; i += 1) shadows.data[i * 4 + 3] = 64;
    const out = printComic(floor, origin, shadows);
    expect(out.data[3]).toBe(0);
    for (let y = 0; y < 20; y += 1) {
      for (let x = 1; x < 20; x += 1) {
        const expected = SCREENS.hatch(x, y) ? hex(INK) : printed(GUIDE.floor, x, y);
        expect(pixel(out, x, y)).toBe(expected);
      }
    }
  });

  it('runs the sea of the world on into the sea tile around it', () => {
    const world = decodePng(read('./world.png'));
    const sea = decodePng(read('./sea.png'));
    const map = JSON.parse(read('../../src/maps/world.json').toString()) as TiledMap;
    const [printedWorld, printedSea] = [printMap(world, map), printMap(sea)];
    // In art pixels: the world image sits where its background does, the tile repeats from (0, 0).
    const { x: left, y: top } = backgroundRect(map);
    let compared = 0;
    for (let y = 0; y < world.height; y += 7) {
      for (let x = 0; x < world.width; x += 7) {
        const [tx, ty] = [(left / 2 + x) % sea.width, (top / 2 + y) % sea.height];
        if (pixel(world, x, y) !== pixel(sea, tx, ty)) continue;
        compared += 1;
        expect(pixel(printedWorld, x, y)).toBe(pixel(printedSea, tx, ty));
      }
    }
    expect(compared).toBeGreaterThan(10000);
  });
});
