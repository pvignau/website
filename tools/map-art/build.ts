/**
 * Builds the map backgrounds from their sources, in this folder:
 *
 * - `<map>.png`: the background at 1 pixel per art pixel (the art grid is
 *   16 px a tile, the map grid 32: one art pixel is 2 × 2 map pixels);
 * - `sprites.ts`: sprites drawn over it, placed by the objects of the `art`
 *   layer of src/maps/<map>.json (named after a sprite, in drawing order);
 *
 * prints them like a comic book (comic.ts) and writes src/maps/<map>.webp
 * twice as large, lossless, with cwebp. The sea around the world map
 * (src/img/sea.webp) comes from `sea.png`. The hero's sprite sheets
 * (src/img/hero/sprite<Direction>.webp) come from `hero.png`, at 1 pixel per
 * pixel of the sprite, inked the same way. The share preview,
 * public/og-image.png, is made from the printed world and hero (og-image.ts).
 *
 *   npm run map-art              rebuild the images
 *   npm run map-art -- --check   only check that they are up to date
 *
 * Both need cwebp and dwebp (libwebp).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HERO } from '../../src/engine/hero.ts';
import { printComic, SHADOW } from './comic.ts';
import type { Image } from './image.ts';
import { createImage, drawImage, enlarge } from './image.ts';
import { renderOgImage } from './og-image.ts';
import { decodePng, encodePng } from './png.ts';
import { SPRITES } from './sprites.ts';

/** Map pixels per art pixel. */
export const ART_SCALE = 2;
/** Name of the Tiled object layer that places sprites. */
export const ART_LAYER = 'art';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const HERE = fileURLToPath(new URL('./', import.meta.url));
/** Work files (PNG for cwebp, PAM from dwebp): node_modules is ignored by git. */
const CACHE = join(ROOT, 'node_modules/.cache/map-art');

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArtObject {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Something the hero walks around, a sign or furniture (the tests check its collision tiles). */
  solid: boolean;
}

interface TiledLayer {
  type?: string;
  name?: string;
  offsetx?: number;
  offsety?: number;
  layers?: TiledLayer[];
  objects?: {
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    properties?: { name?: string; value?: unknown }[];
  }[];
}

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  properties?: { name?: string; value?: unknown }[];
}

/**
 * Where the background image sits, in map pixels: the image exported by Tiled
 * grows to fit layer offsets, and the crop-* map properties keep a part of it.
 * Same computation as the engine (src/engine/tiled.ts); a test compares them.
 */
export function backgroundRect(map: TiledMap): Rect {
  const offsets: { x: number; y: number }[] = [];
  const walk = (layers: TiledLayer[], dx: number, dy: number) => {
    for (const layer of layers) {
      if (layer.name === 'meta') continue;
      const x = dx + (layer.offsetx ?? 0);
      const y = dy + (layer.offsety ?? 0);
      if (layer.type === 'group') walk(layer.layers ?? [], x, y);
      if (layer.type === 'tilelayer') offsets.push({ x, y });
    }
  };
  walk(map.layers, 0, 0);
  const left = Math.floor(Math.min(0, ...offsets.map(({ x }) => x)));
  const top = Math.floor(Math.min(0, ...offsets.map(({ y }) => y)));
  const right = Math.ceil(Math.max(0, ...offsets.map(({ x }) => x)));
  const bottom = Math.ceil(Math.max(0, ...offsets.map(({ y }) => y)));
  const property = (name: string) => map.properties?.find((entry) => entry.name === name)?.value;
  const crop = ['crop-x', 'crop-y', 'crop-width', 'crop-height'].map(property);
  if (crop.every((value) => typeof value === 'number')) {
    const [x = 0, y = 0, width = 0, height = 0] = crop;
    return { x: left + x, y: top + y, width, height };
  }
  return {
    x: left,
    y: top,
    width: map.width * map.tilewidth - left + right,
    height: map.height * map.tileheight - top + bottom,
  };
}

/** The objects of the `art` layer. */
export function artObjects(map: TiledMap): ArtObject[] {
  const layer = map.layers.find(
    (entry) => entry.type === 'objectgroup' && entry.name === ART_LAYER,
  );
  return (layer?.objects ?? []).map((object) => ({
    name: object.name ?? '',
    x: object.x ?? 0,
    y: object.y ?? 0,
    width: object.width ?? 0,
    height: object.height ?? 0,
    solid:
      object.properties?.some((entry) => entry.name === 'solid' && entry.value === true) ?? false,
  }));
}

/** Draws the sprites of `objects` over a copy of `base`, whose top-left corner is `origin` (map pixels). */
export function compose(
  base: Image,
  objects: readonly ArtObject[],
  origin: Rect,
  sprites: Readonly<Record<string, Image>> = SPRITES,
): Image {
  const image: Image = { width: base.width, height: base.height, data: Uint8Array.from(base.data) };
  if (base.width * ART_SCALE !== origin.width || base.height * ART_SCALE !== origin.height) {
    throw new Error(
      `The base is ${base.width} × ${base.height}, expected ${origin.width / ART_SCALE} × ${origin.height / ART_SCALE}.`,
    );
  }
  for (const object of objects) {
    const sprite = sprites[object.name];
    if (!sprite) throw new Error(`No sprite named "${object.name}".`);
    const x = (object.x - origin.x) / ART_SCALE;
    const y = (object.y - origin.y) / ART_SCALE;
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error(`"${object.name}" must sit on the art grid (even map pixels).`);
    }
    if (object.width !== sprite.width * ART_SCALE || object.height !== sprite.height * ART_SCALE) {
      throw new Error(
        `"${object.name}" must be ${sprite.width * ART_SCALE} × ${sprite.height * ART_SCALE} map pixels, like its sprite.`,
      );
    }
    drawImage(image, sprite, x, y);
  }
  return image;
}

interface Output {
  /** Base art, in this folder. */
  base: string;
  /** Tiled map placing the sprites, if any. */
  map?: string;
  /** Image used by the game. */
  out: string;
}

const OUTPUTS: readonly Output[] = [
  { base: 'world.png', map: 'src/maps/world.json', out: 'src/maps/world.webp' },
  { base: 'home.png', map: 'src/maps/home.json', out: 'src/maps/home.webp' },
  { base: 'sea.png', out: 'src/img/sea.webp' },
];

/** The share preview. */
const OG_IMAGE = 'public/og-image.png';

/**
 * The hero's sheets, stacked from top to bottom in hero.png in this order:
 * each is a row of HERO.sprite.frames frames, the first one standing.
 */
export const HERO_SHEETS = ['Down', 'Left', 'Right', 'Up'] as const;
const heroSheetFile = (direction: (typeof HERO_SHEETS)[number]) =>
  `src/img/hero/sprite${direction}.webp`;

function crop(image: Image, rect: Rect): Image {
  const out = createImage(rect.width, rect.height);
  for (let y = 0; y < rect.height; y += 1) {
    const from = ((rect.y + y) * image.width + rect.x) * 4;
    out.data.set(image.data.subarray(from, from + rect.width * 4), y * rect.width * 4);
  }
  return out;
}

/**
 * Prints the hero like the sprites of the maps (comic.ts): the colours of the
 * guide, and an ink line one pixel wide along the edge of the figure. Each
 * frame is printed on its own, with a transparent margin: what touches the
 * edge of a frame (the hair) is inked there too, as the game crops it.
 */
export function printHero(sheet: Image): Image {
  const { width, height } = HERO.sprite;
  const out = createImage(sheet.width, sheet.height);
  for (let y = 0; y < sheet.height; y += height) {
    for (let x = 0; x < sheet.width; x += width) {
      const frame = createImage(width + 2, height + 2);
      drawImage(frame, crop(sheet, { x, y, width, height }), 1, 1);
      const printed = printComic(frame, { x: 0, y: 0 });
      drawImage(out, crop(printed, { x: 1, y: 1, width, height }), x, y);
    }
  }
  return out;
}

/** The printed sheets of the hero, by direction. */
function renderHero(): Record<(typeof HERO_SHEETS)[number], Image> {
  const printed = printHero(decodePng(readFileSync(join(HERE, 'hero.png'))));
  const { width, height, frames } = HERO.sprite;
  const sheets = HERO_SHEETS.map((direction, row) => [
    direction,
    crop(printed, { x: 0, y: row * height, width: width * frames, height }),
  ]);
  return Object.fromEntries(sheets) as Record<(typeof HERO_SHEETS)[number], Image>;
}

/** Splits sprites into what they draw and the shadows they cast (SHADOW pixels). */
export function castShadows(sprites: Readonly<Record<string, Image>>) {
  const shadow = Number.parseInt(SHADOW.slice(1), 16);
  const bodies: Record<string, Image> = {};
  const shadows: Record<string, Image> = {};
  for (const [name, sprite] of Object.entries(sprites)) {
    const body = { ...sprite, data: Uint8Array.from(sprite.data) };
    const cast = { ...sprite, data: Uint8Array.from(sprite.data) };
    const pixels = new DataView(sprite.data.buffer, sprite.data.byteOffset, sprite.data.byteLength);
    for (let i = 0; i < sprite.width * sprite.height; i += 1) {
      const target = pixels.getUint32(i * 4) === shadow ? body : cast;
      target.data[i * 4 + 3] = 0;
    }
    bodies[name] = body;
    shadows[name] = cast;
  }
  return { bodies, shadows };
}

const { bodies: BODIES, shadows: SHADOWS } = castShadows(SPRITES);

/** The art of a map, sprites drawn, printed like a comic (comic.ts), at 1 pixel per art pixel. */
export function printMap(base: Image, map?: TiledMap): Image {
  if (map === undefined) return printComic(base, { x: 0, y: 0 });
  const rect = backgroundRect(map);
  const objects = artObjects(map);
  const origin = { x: rect.x / ART_SCALE, y: rect.y / ART_SCALE };
  if (!Number.isInteger(origin.x) || !Number.isInteger(origin.y)) {
    throw new Error('The background must sit on the art grid (even map pixels).');
  }
  const shadows = compose(createImage(base.width, base.height), objects, rect, SHADOWS);
  return printComic(compose(base, objects, rect, BODIES), origin, shadows);
}

const readMap = (file: string) => JSON.parse(readFileSync(join(ROOT, file), 'utf8')) as TiledMap;

function render({ base, map }: Output): Image {
  const art = decodePng(readFileSync(join(HERE, base)));
  return enlarge(printMap(art, map === undefined ? undefined : readMap(map)), ART_SCALE);
}

/** Reads a PAM file written by `dwebp -pam`. */
function readPam(file: Uint8Array): Image {
  const text = Buffer.from(file.subarray(0, 128)).toString('latin1');
  const end = text.indexOf('ENDHDR\n') + 'ENDHDR\n'.length;
  const field = (name: string) => Number(new RegExp(`${name} (\\d+)`).exec(text)?.[1]);
  const [width, height, depth] = [field('WIDTH'), field('HEIGHT'), field('DEPTH')];
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data.set(file.subarray(end + i * depth, end + i * depth + 3), i * 4);
    data[i * 4 + 3] = depth === 4 ? (file[end + i * depth + 3] ?? 0) : 255;
  }
  return { width, height, data };
}

/** Decodes a WebP file of the project with dwebp. */
function readWebp(file: string): Image {
  const pam = join(CACHE, `${file.replace(/\W+/g, '-')}.pam`);
  execFileSync('dwebp', ['-quiet', '-pam', join(ROOT, file), '-o', pam]);
  return readPam(readFileSync(pam));
}

/** The share preview: the printed world, and the hero facing down, standing (frame 0). */
function renderShareImage(down: Image): Image {
  const map = readMap('src/maps/world.json');
  const world = printMap(decodePng(readFileSync(join(HERE, 'world.png'))), map);
  const { width, height } = HERO.sprite;
  return renderOgImage(world, backgroundRect(map), crop(down, { x: 0, y: 0, width, height }));
}

function sameImage(a: Image, b: Image): boolean {
  if (a.width !== b.width || a.height !== b.height) return false;
  for (let i = 0; i < a.data.length; i += 4) {
    const alpha = a.data[i + 3];
    if (alpha !== b.data[i + 3]) return false;
    // Fully transparent pixels: their colour does not show.
    if (alpha === 0) continue;
    if (
      a.data[i] !== b.data[i] ||
      a.data[i + 1] !== b.data[i + 1] ||
      a.data[i + 2] !== b.data[i + 2]
    ) {
      return false;
    }
  }
  return true;
}

function main(check: boolean): void {
  mkdirSync(CACHE, { recursive: true });
  let stale = 0;
  const verify = (file: string, image: Image, current: () => Image) => {
    const upToDate = sameImage(image, current());
    if (!upToDate) stale += 1;
    console.log(`${upToDate ? 'up to date' : 'OUT OF DATE'}  ${file}`);
  };
  const write = (out: string, image: Image) => {
    if (check) {
      verify(out, image, () => readWebp(out));
      return;
    }
    const png = join(CACHE, `${out.replace(/\W+/g, '-')}.png`);
    writeFileSync(png, encodePng(image));
    const target = join(ROOT, out);
    execFileSync('cwebp', ['-quiet', '-lossless', '-z', '9', '-exact', png, '-o', target]);
    console.log(`wrote ${out} (${image.width} × ${image.height})`);
  };
  for (const output of OUTPUTS) write(output.out, render(output));
  const hero = renderHero();
  for (const direction of HERO_SHEETS) write(heroSheetFile(direction), hero[direction]);
  const share = renderShareImage(hero.Down);
  if (check) {
    verify(OG_IMAGE, share, () => decodePng(readFileSync(join(ROOT, OG_IMAGE))));
  } else {
    writeFileSync(join(ROOT, OG_IMAGE), encodePng(share));
    console.log(`wrote ${OG_IMAGE} (${share.width} × ${share.height})`);
  }
  if (stale > 0) {
    console.error('Run `npm run map-art` to rebuild the images.');
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.includes('--check'));
