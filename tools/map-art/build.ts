/**
 * Builds the map backgrounds from their sources, in this folder:
 *
 * - `<map>.png`: the background at 1 pixel per art pixel (the art grid is
 *   16 px a tile, the map grid 32: one art pixel is 2 × 2 map pixels);
 * - `sprites.ts`: sprites drawn over it, placed by the objects of the `art`
 *   layer of src/maps/<map>.json (named after a sprite, in drawing order);
 *
 * and writes src/maps/<map>.webp twice as large, lossless, with cwebp. The sea
 * around the world map (src/img/sea.webp) comes from `sea.png`.
 *
 *   npm run map-art              rebuild the images
 *   npm run map-art -- --check   only check that they are up to date (needs dwebp)
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Image } from './image.ts';
import { drawImage, enlarge } from './image.ts';
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

interface TiledMap {
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

function render({ base, map }: Output): Image {
  const art = decodePng(readFileSync(join(HERE, base)));
  if (map === undefined) return enlarge(art, ART_SCALE);
  const tiled = JSON.parse(readFileSync(join(ROOT, map), 'utf8')) as TiledMap;
  return enlarge(compose(art, artObjects(tiled), backgroundRect(tiled)), ART_SCALE);
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
  for (const output of OUTPUTS) {
    const image = render(output);
    const name = output.out.replace(/\W+/g, '-');
    const target = join(ROOT, output.out);
    if (check) {
      const pam = join(CACHE, `${name}.pam`);
      execFileSync('dwebp', ['-quiet', '-pam', target, '-o', pam]);
      const upToDate = sameImage(image, readPam(readFileSync(pam)));
      if (!upToDate) stale += 1;
      console.log(`${upToDate ? 'up to date' : 'OUT OF DATE'}  ${output.out}`);
      continue;
    }
    const png = join(CACHE, `${name}.png`);
    writeFileSync(png, encodePng(image));
    execFileSync('cwebp', ['-quiet', '-lossless', '-z', '9', '-exact', png, '-o', target]);
    console.log(`wrote ${output.out} (${image.width} × ${image.height})`);
  }
  if (stale > 0) {
    console.error('Run `npm run map-art` to rebuild the images.');
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.includes('--check'));
