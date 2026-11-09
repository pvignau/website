import { describe, expect, it } from 'vitest';
import { computeCamera, computeScale } from '../engine/camera';
import { isSolidTile, rectHitsSolid } from '../engine/collision';
import type { Rect } from '../engine/geometry';
import { HERO, heroHitbox } from '../engine/hero';
import type { GameMap } from '../engine/tiled';
import { findSpawn } from '../engine/tiled';
import homeImage from '../maps/home.webp?inline';
import worldTiled from '../maps/world.json';
import worldImage from '../maps/world.webp?inline';
import { MAPS } from './maps';

/** Reads the canvas size from a WebP file header (VP8X, VP8L or VP8 chunk). */
function webpSize(dataUrl: string) {
  const bytes = Uint8Array.from(atob(dataUrl.split(',')[1] ?? ''), (char) => char.charCodeAt(0));
  const at = (index: number) => bytes[index] ?? 0;
  const chunk = String.fromCharCode(at(12), at(13), at(14), at(15));
  if (chunk === 'VP8X') {
    return {
      width: 1 + (at(24) | (at(25) << 8) | (at(26) << 16)),
      height: 1 + (at(27) | (at(28) << 8) | (at(29) << 16)),
    };
  }
  if (chunk === 'VP8L') {
    const bits = at(21) | (at(22) << 8) | (at(23) << 16) | (at(24) << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { width: (at(26) | (at(27) << 8)) & 0x3fff, height: (at(28) | (at(29) << 8)) & 0x3fff };
}

/** Distance between two rectangles (0 when they overlap). */
function rectDistance(a: Rect, b: Rect): number {
  const dx = Math.max(b.x - (a.x + a.width), 0, a.x - (b.x + b.width));
  const dy = Math.max(b.y - (a.y + a.height), 0, a.y - (b.y + b.height));
  return Math.hypot(dx, dy);
}

/** Free tiles reachable on foot from the default spawn (4-neighbourhood flood fill). */
function reachableTiles(map: GameMap): Rect[] {
  const { collisions, tileSize } = map;
  const start = findSpawn(map, null).position;
  const queue: [number, number][] = [
    [Math.floor(start.x / tileSize), Math.floor(start.y / tileSize)],
  ];
  const seen = new Set<string>();
  const tiles: Rect[] = [];
  while (queue.length > 0) {
    const [column, row] = queue.shift() ?? [0, 0];
    const key = `${column},${row}`;
    if (seen.has(key) || isSolidTile(collisions, column, row)) continue;
    seen.add(key);
    tiles.push({ x: column * tileSize, y: row * tileSize, width: tileSize, height: tileSize });
    queue.push([column + 1, row], [column - 1, row], [column, row + 1], [column, row - 1]);
  }
  return tiles;
}

describe.each([
  ['world', MAPS.world.data, worldImage],
  ['home', MAPS.home.data, homeImage],
])('the %s map', (_, map, image) => {
  it('matches the size of its exported background image', () => {
    const { width, height } = map.background;
    expect({ width, height }).toEqual(webpSize(image));
  });

  it('spawns the hero on free ground', () => {
    for (const spawn of map.spawns) {
      expect(rectHitsSolid(map.collisions, heroHitbox(spawn.position)), spawn.name).toBe(false);
    }
  });

  it('lets the hero reach every spawn and every interactive object', () => {
    const tiles = reachableTiles(map);
    const reaches = (rect: Rect, radius: number) =>
      tiles.some((tile) => {
        // Where the interaction point can be while the hero stands on this tile.
        const { width, height } = heroHitbox({ x: 0, y: 0 });
        const zone = {
          x: tile.x + width / 2,
          y: tile.y + height / 2,
          width: tile.width - width,
          height: tile.height - height,
        };
        return rectDistance(zone, rect) <= radius;
      });
    for (const { name, position } of map.spawns) {
      const standsOn = (tile: Rect) =>
        position.x >= tile.x &&
        position.x < tile.x + tile.width &&
        position.y > tile.y &&
        position.y <= tile.y + tile.height;
      expect(tiles.some(standsOn), name).toBe(true);
    }
    for (const item of map.interactables) {
      expect(reaches(item.rect, item.radius), `${item.kind} ${item.name}`).toBe(true);
    }
  });
});

/** Whether `inner` lies within `outer`, give or take a pixel (the camera snaps to device pixels). */
function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x - 1 &&
    inner.y >= outer.y - 1 &&
    inner.x + inner.width <= outer.x + outer.width + 1 &&
    inner.y + inner.height <= outer.y + outer.height + 1
  );
}

interface TiledLayer {
  type: string;
  name: string;
  width?: number;
  data?: number[];
  offsetx?: number;
  offsety?: number;
  layers?: TiledLayer[];
  objects?: {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    properties?: { name: string; value: unknown }[];
  }[];
}

/** Bounding box, in map pixels, of the tiles drawn by the visual layers except `Sea`. */
function landBounds(layers: TiledLayer[], tileSize: number): Rect {
  let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = (list: TiledLayer[], dx: number, dy: number) => {
    for (const layer of list) {
      const x = dx + (layer.offsetx ?? 0);
      const y = dy + (layer.offsety ?? 0);
      if (layer.type === 'group' && layer.name !== 'meta') walk(layer.layers ?? [], x, y);
      if (layer.type !== 'tilelayer' || layer.name === 'Sea') continue;
      const columns = layer.width ?? 1;
      (layer.data ?? []).forEach((tile, index) => {
        if (tile === 0) return;
        const column = index % columns;
        const row = Math.floor(index / columns);
        left = Math.min(left, column * tileSize + x);
        top = Math.min(top, row * tileSize + y);
        right = Math.max(right, (column + 1) * tileSize + x);
        bottom = Math.max(bottom, (row + 1) * tileSize + y);
      });
    }
  };
  walk(layers, 0, 0);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** Phones (both ways up), tablets, laptops and desktops, 21:9 included: [width, height, DPR]. */
const SCREENS: [number, number, number][] = [
  [320, 568, 2],
  [360, 740, 3],
  [375, 667, 2],
  [390, 844, 3],
  [412, 915, 2.625],
  [430, 932, 3],
  [568, 320, 2],
  [740, 360, 3],
  [667, 375, 2],
  [844, 390, 3],
  [915, 412, 2.625],
  [932, 430, 3],
  [768, 1024, 2],
  [1024, 768, 2],
  [820, 1180, 2],
  [1180, 820, 2],
  [1024, 1366, 2],
  [1366, 1024, 2],
  [1280, 720, 1],
  [1280, 800, 2],
  [1366, 768, 1],
  [1440, 900, 2],
  [1536, 864, 1.25],
  [1920, 1080, 1],
  [1920, 1200, 1],
  [2560, 1440, 1],
  [2560, 1600, 2],
  [3440, 1440, 1],
];

describe('the cropped world image', () => {
  const world = MAPS.world.data;

  it('holds every tile drawn outside the Sea layer, with a tile to spare', () => {
    const land = landBounds(worldTiled.layers, world.tileSize);
    const spare = world.tileSize;
    const around = {
      x: land.x - spare,
      y: land.y - spare,
      width: land.width + 2 * spare,
      height: land.height + 2 * spare,
    };
    expect(
      contains(world.background, around),
      JSON.stringify({ land, image: world.background }),
    ).toBe(true);
  });

  it('covers all the camera shows on common screens, wherever the hero walks', () => {
    const tiles = reachableTiles(world);
    const { width: feetWidth } = heroHitbox({ x: 0, y: 0 });
    const misses = new Set<string>();
    for (const [width, height, dpr] of SCREENS) {
      const viewport = { width, height };
      const scale = computeScale(viewport, world.tileSize, dpr);
      for (const tile of tiles) {
        // Where the feet can be on this tile (hitbox inside it), at its four corners.
        for (const x of [tile.x + feetWidth / 2, tile.x + tile.width - feetWidth / 2]) {
          for (const y of [tile.y + HERO.hitbox.height, tile.y + tile.height]) {
            // Same focus as useHeroController: the middle of the sprite.
            const focus = { x, y: y - HERO.sprite.height / 2 };
            const camera = computeCamera(focus, viewport, world, scale, dpr);
            const shown = {
              x: -camera.x / scale,
              y: -camera.y / scale,
              width: width / scale,
              height: height / scale,
            };
            if (!contains(world.background, shown)) misses.add(`${width}x${height}@${dpr}`);
          }
        }
      }
    }
    expect([...misses]).toEqual([]);
  });

  it('lets the sea pattern draw the rest, on the tile grid', () => {
    expect(MAPS.world.sea).toBe(true);
    expect(world.background.x % world.tileSize).toBe(0);
    expect(world.background.y % world.tileSize).toBe(0);
    expect(MAPS.home.sea).toBe(false);
  });
});

/** Sprites of the `art` layer marked `solid`: furniture, signs (tools/map-art draws them). */
function solidArt(layers: TiledLayer[]): (Rect & { name: string })[] {
  const art = layers.find((layer) => layer.type === 'objectgroup' && layer.name === 'art');
  return (art?.objects ?? [])
    .filter((object) => object.properties?.some((p) => p.name === 'solid' && p.value === true))
    .map(({ name, x, y, width, height }) => ({ name, x, y, width, height }));
}

describe.each([['world', worldTiled.layers, MAPS.world.data]])(
  'the solid art of the %s map',
  (_, layers, map) => {
    const objects = solidArt(layers);
    const { collisions, tileSize } = map;

    it('exists', () => {
      expect(objects.length).toBeGreaterThan(0);
    });

    it('stands on solid tiles: the hero walks around it, not over it', () => {
      for (const object of objects) {
        // Where it touches the floor (its last rows are a shadow), then every tile it half covers.
        const column = Math.floor((object.x + object.width / 2) / tileSize);
        const row = Math.floor((object.y + object.height - 4) / tileSize);
        expect(isSolidTile(collisions, column, row), `${object.name} on ${column},${row}`).toBe(
          true,
        );
        for (
          let r = Math.floor(object.y / tileSize);
          r * tileSize < object.y + object.height;
          r++
        ) {
          for (
            let c = Math.floor(object.x / tileSize);
            c * tileSize < object.x + object.width;
            c++
          ) {
            const tile = { x: c * tileSize, y: r * tileSize, width: tileSize, height: tileSize };
            const covered =
              Math.max(
                0,
                Math.min(tile.x + tileSize, object.x + object.width) - Math.max(tile.x, object.x),
              ) *
              Math.max(
                0,
                Math.min(tile.y + tileSize, object.y + object.height) - Math.max(tile.y, object.y),
              );
            if (covered >= (tileSize * tileSize) / 2) {
              expect(isSolidTile(collisions, c, r), `${object.name} over ${c},${r}`).toBe(true);
            }
          }
        }
      }
    });
  },
);

describe('map content', () => {
  const world = MAPS.world.data;
  const home = MAPS.home.data;
  const summary = (map: GameMap) =>
    map.interactables.map((item) =>
      item.kind === 'place' ? `place:${item.placeId}` : `warp:${item.name}->${item.to}`,
    );

  it('puts the house door, the projects, the lab and the boat on the world map', () => {
    expect(new Set(summary(world))).toEqual(
      new Set(['warp:home->/home', 'place:work', 'place:lab', 'place:contact']),
    );
    expect(findSpawn(world, '/home').facing).toBe('down');
    expect(findSpawn(world, '/work').name).toBe('spawn-work');
  });

  it('puts the bio and the way out in the house', () => {
    expect(summary(home).sort()).toEqual(['place:home', 'warp:exit->/']);
  });
});
