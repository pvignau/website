import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOTE_IDS } from '../../src/content/notes.ts';
import { PLACE_IDS, PLACE_VIEW_IDS } from '../../src/content/places.ts';
import { parseTiledMap } from '../../src/engine/tiled.ts';
import { HERO } from '../../src/engine/hero.ts';
import {
  ART_SCALE,
  artObjects,
  backgroundRect,
  castShadows,
  compose,
  HERO_SHEETS,
  printHero,
} from './build.ts';
import { INK, SHADOW } from './comic.ts';
import type { Image } from './image.ts';
import { createImage } from './image.ts';
import { decodePng } from './png.ts';
import { parseSprite } from './sprite.ts';

const read = (path: string) => readFileSync(new URL(path, import.meta.url));
const MAPS = [
  { name: 'world', base: './world.png', image: '../../src/maps/world.webp' },
  { name: 'home', base: './home.png', image: '../../src/maps/home.webp' },
];

/** Canvas size from a WebP file header (VP8X or VP8L chunk). */
function webpSize(file: Uint8Array) {
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  if (String.fromCharCode(...file.subarray(12, 16)) === 'VP8X') {
    return {
      width: 1 + (view.getUint32(24, true) & 0xffffff),
      height: 1 + (view.getUint32(27, true) & 0xffffff),
    };
  }
  const bits = view.getUint32(21, true);
  return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
}

describe.each(MAPS)('the $name map', ({ name, base, image }) => {
  const tiled = JSON.parse(read(`../../src/maps/${name}.json`).toString()) as Parameters<
    typeof backgroundRect
  >[0];

  it('places its background like the engine does', () => {
    const engine = parseTiledMap(tiled, {
      placeIds: PLACE_IDS,
      noteIds: NOTE_IDS,
      viewIds: PLACE_VIEW_IDS,
    });
    expect(backgroundRect(tiled)).toEqual(engine.background);
  });

  it('draws its sprites on the art grid, at the size of their art objects', () => {
    const art = decodePng(read(base));
    expect(artObjects(tiled).length).toBeGreaterThan(0);
    expect(() => compose(art, artObjects(tiled), backgroundRect(tiled))).not.toThrow();
  });

  it('ships an image twice as large as its base', () => {
    const art = decodePng(read(base));
    expect(webpSize(read(image))).toEqual({
      width: art.width * ART_SCALE,
      height: art.height * ART_SCALE,
    });
  });
});

describe('compose', () => {
  const dot = parseSprite('dot', { a: '#ff0000' }, 'a.\n.a');
  const sprites = { dot };
  const origin = { x: -2, y: -2, width: 8 * ART_SCALE, height: 8 * ART_SCALE };
  const object = { name: 'dot', x: 4, y: 2, width: 4, height: 4, solid: false };
  const opaque = (image: Image) =>
    Array.from({ length: image.width * image.height }, (_, i) => i).filter(
      (i) => image.data[i * 4 + 3] === 255,
    );

  it('draws a sprite where its object is, in art pixels from the image corner', () => {
    // (4, 2) map px from a corner at (-2, -2): art pixel (3, 2), then (4, 3).
    expect(opaque(compose(createImage(8, 8), [object], origin, sprites))).toEqual([
      2 * 8 + 3,
      3 * 8 + 4,
    ]);
  });

  it('refuses a sprite off the art grid, of another size or unknown, or a base of another size', () => {
    const base = createImage(8, 8);
    expect(() => compose(base, [{ ...object, x: 5 }], origin, sprites)).toThrow(/art grid/);
    expect(() => compose(base, [{ ...object, width: 2 }], origin, sprites)).toThrow(
      /like its sprite/,
    );
    expect(() => compose(base, [{ ...object, name: 'nope' }], origin, sprites)).toThrow(
      /No sprite/,
    );
    expect(() => compose(createImage(4, 4), [], origin, sprites)).toThrow(/The base is 4 × 4/);
  });
});

describe('the hero', () => {
  const source = decodePng(read('./hero.png'));
  const { width, height, frames } = HERO.sprite;
  const printed = printHero(source);
  const at = (image: Image, x: number, y: number) =>
    [...image.data.subarray((y * image.width + x) * 4, (y * image.width + x) * 4 + 4)].join();
  const ink = [...INK, 255].join();

  it('stacks one sheet a direction, of the frames the engine reads', () => {
    expect({ width: source.width, height: source.height }).toEqual({
      width: width * frames,
      height: height * HERO_SHEETS.length,
    });
    expect({ width: printed.width, height: printed.height }).toEqual({
      width: source.width,
      height: source.height,
    });
  });

  it('inks the edge of the figure in every frame, the edge of the frame included', () => {
    const transparent = (x: number, y: number) =>
      (printed.data[(y * printed.width + x) * 4 + 3] ?? 0) === 0;
    const stray: string[] = [];
    for (let y = 0; y < printed.height; y += 1) {
      for (let x = 0; x < printed.width; x += 1) {
        if (transparent(x, y)) continue;
        const [fx, fy] = [x % width, y % height];
        // The edge of the frame first: no neighbour is read across it.
        const edge =
          fx === 0 ||
          fy === 0 ||
          fx === width - 1 ||
          fy === height - 1 ||
          transparent(x - 1, y) ||
          transparent(x + 1, y) ||
          transparent(x, y - 1) ||
          transparent(x, y + 1);
        if (edge && at(printed, x, y) !== ink) stray.push(`${x},${y}`);
      }
    }
    expect(stray).toEqual([]);
  });
});

describe('castShadows', () => {
  it('parts what a sprite draws from the shadow it casts', () => {
    const sprite = parseSprite('s', { a: '#ff0000', _: SHADOW }, 'a_');
    const { bodies, shadows } = castShadows({ s: sprite });
    expect([...(bodies.s?.data ?? [])]).toEqual([255, 0, 0, 255, 0, 0, 0, 0]);
    expect([...(shadows.s?.data ?? [])]).toEqual([255, 0, 0, 0, 0, 0, 0, 64]);
  });
});

describe('parseSprite', () => {
  it('reads one character a pixel, with the colours of its palette', () => {
    const image = parseSprite('test', { a: '#102030', b: '#ffffff80' }, '\n  a.\n  .b\n');
    expect([...image.data]).toEqual([16, 32, 48, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 128]);
  });

  it('refuses rows of different lengths, unknown characters and bad colours', () => {
    expect(() => parseSprite('t', { a: '#000000' }, 'aa\na')).toThrow(/row 1 has 1 pixels/);
    expect(() => parseSprite('t', { a: '#000000' }, 'ab')).toThrow(/no colour for "b"/);
    expect(() => parseSprite('t', { a: 'red' }, 'a')).toThrow(/not #rrggbb/);
    expect(() => parseSprite('t', {}, '\n\n')).toThrow(/empty/);
  });
});
