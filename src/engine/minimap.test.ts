import { describe, expect, it } from 'vitest';
import { createCollisionGrid } from './collision';
import type { Rect } from './geometry';
import type { MinimapLayout } from './minimap';
import {
  MINIMAP_MARGIN_TILES,
  MINIMAP_MAX_PIXELS,
  minimapLayout,
  minimapScale,
  projectToMinimap,
  spreadMarkers,
  walkableBounds,
} from './minimap';
import type { GameMap, Interactable } from './tiled';

type Place = 'home' | 'work';

const TILE = 32;

/**
 * A map drawn as text, one character per tile: "#" solid, "." free, "S" the
 * default spawn, "@" a default spawn standing in a wall. Its background image
 * covers the whole map unless told otherwise.
 */
function mapOf(
  rows: string[],
  {
    interactables = [],
    background,
  }: { interactables?: Interactable<Place>[]; background?: Rect } = {},
): GameMap<Place> {
  const columns = rows[0]?.length ?? 0;
  const cells = rows.flatMap((row) =>
    Array.from(row).map((cell) => (cell === '#' || cell === '@' ? 1 : 0)),
  );
  const spawnIndex = rows.join('').search(/[S@]/);
  const spawn = {
    name: 'spawn',
    entry: null,
    position: {
      x: (spawnIndex % columns) * TILE + TILE / 2,
      y: Math.floor(spawnIndex / columns) * TILE + TILE - 2,
    },
    facing: 'down' as const,
  };
  const width = columns * TILE;
  const height = rows.length * TILE;
  return {
    width,
    height,
    tileSize: TILE,
    collisions: createCollisionGrid(columns, rows.length, TILE, cells),
    interactables,
    decorations: [],
    spawns: [spawn],
    background: background ?? { x: 0, y: 0, width, height },
  };
}

function place(id: string, placeId: Place, rect: Rect): Interactable<Place> {
  return { kind: 'place', id, name: placeId, placeId, rect, radius: 24 };
}

/** 12 × 10 tiles: a 4 × 3 island ringed by rocks, a pond of free tiles out of reach. */
const ISLAND = [
  '############',
  '#..........#',
  '#..######..#',
  '#..#....#..#',
  '#..#.S..#..#',
  '#..#....#..#',
  '#..######..#',
  '#..........#',
  '#..........#',
  '############',
];

describe('walkableBounds', () => {
  it('frames the tiles reachable on foot from the default spawn, not the others', () => {
    expect(walkableBounds(mapOf(ISLAND))).toEqual({
      x: 4 * TILE,
      y: 3 * TILE,
      width: 4 * TILE,
      height: 3 * TILE,
    });
  });

  it('finds nothing when the spawn stands in a wall', () => {
    expect(walkableBounds(mapOf(['###', '#@.', '###']))).toBeNull();
  });
});

describe('minimapLayout', () => {
  it('frames the walkable ground and its objects, with sea around, within the image', () => {
    const map = mapOf(ISLAND, {
      interactables: [place('1', 'work', { x: 8 * TILE, y: 3 * TILE, width: 32, height: 32 })],
    });
    const layout = minimapLayout(map);
    // Walkable: columns 4 to 7, rows 3 to 5; the object reaches column 8. Plus three tiles
    // of sea on each side, cut to the image (the whole map here).
    const margin = MINIMAP_MARGIN_TILES * TILE;
    expect(layout.frame).toEqual({
      x: 4 * TILE - margin,
      y: 0,
      width: 5 * TILE + 2 * margin,
      height: 9 * TILE,
    });
    expect(layout.blockSize).toBe(4);
    expect(layout.width * layout.blockSize).toBe(layout.frame.width);
    expect(layout.height * layout.blockSize).toBe(layout.frame.height);
  });

  it('keeps to the background image, on its grid of blocks', () => {
    const map = mapOf(ISLAND, { background: { x: 70, y: 50, width: 200, height: 220 } });
    const { frame, blockSize } = minimapLayout(map);
    expect(frame.x).toBeGreaterThanOrEqual(70);
    expect(frame.y).toBeGreaterThanOrEqual(50);
    expect(frame.x + frame.width).toBeLessThanOrEqual(270);
    expect(frame.y + frame.height).toBeLessThanOrEqual(270);
    expect((frame.x - 70) % blockSize).toBe(0);
    expect((frame.y - 50) % blockSize).toBe(0);
  });

  it('takes bigger blocks for a bigger area, the longest side within bounds', () => {
    const wide = ['#'.repeat(300), `#S${'.'.repeat(297)}#`, '#'.repeat(300)];
    const layout = minimapLayout(mapOf(wide));
    expect(Math.max(layout.width, layout.height)).toBeLessThanOrEqual(MINIMAP_MAX_PIXELS);
    expect(Math.log2(layout.blockSize) % 1).toBe(0);
    expect(layout.blockSize).toBe(128);
  });

  it('marks each place at the middle of its objects, and leaves plain exits out', () => {
    const map = mapOf(ISLAND, {
      interactables: [
        place('1', 'work', { x: 128, y: 96, width: 32, height: 32 }),
        place('2', 'work', { x: 160, y: 128, width: 32, height: 32 }),
        {
          kind: 'warp',
          id: '3',
          name: 'exit',
          to: '/',
          placeId: null,
          rect: { x: 192, y: 96, width: 32, height: 32 },
          radius: 24,
        },
        {
          kind: 'warp',
          id: '4',
          name: 'home',
          to: '/home',
          placeId: 'home',
          rect: { x: 224, y: 160, width: 32, height: 32 },
          radius: 24,
        },
      ],
    });
    const layout = minimapLayout(map);
    const at = (x: number, y: number) => ({
      x: (x - layout.frame.x) / layout.blockSize,
      y: (y - layout.frame.y) / layout.blockSize,
    });
    expect(layout.places).toEqual([
      { placeId: 'work', ...at(160, 128) },
      { placeId: 'home', ...at(240, 176) },
    ]);
  });
});

describe('projectToMinimap', () => {
  const layout: MinimapLayout<Place> = {
    frame: { x: 100, y: 200, width: 160, height: 80 },
    blockSize: 16,
    width: 10,
    height: 5,
    places: [],
  };

  it('finds the pixel under a map point', () => {
    expect(projectToMinimap({ x: 100, y: 200 }, layout)).toEqual({ x: 0, y: 0 });
    expect(projectToMinimap({ x: 133, y: 247.5 }, layout)).toEqual({ x: 2, y: 2 });
    expect(projectToMinimap({ x: 259.9, y: 279.9 }, layout)).toEqual({ x: 9, y: 4 });
  });

  it('keeps points off the frame on its edge', () => {
    expect(projectToMinimap({ x: 0, y: 1000 }, layout)).toEqual({ x: 0, y: 4 });
    expect(projectToMinimap({ x: 999, y: -5 }, layout)).toEqual({ x: 9, y: 0 });
  });
});

describe('minimapScale', () => {
  it('draws the minimap about a third of the shorter side of the screen wide', () => {
    expect(minimapScale({ width: 1280, height: 720 }, 96, 1)).toBe(2);
    expect(minimapScale({ width: 390, height: 844 }, 96, 3)).toBeCloseTo(4 / 3);
    expect(minimapScale({ width: 568, height: 320 }, 96, 2)).toBe(1);
  });

  it('stays between one and two CSS pixels per pixel', () => {
    expect(minimapScale({ width: 3840, height: 2160 }, 96, 1)).toBe(2);
    expect(minimapScale({ width: 200, height: 200 }, 96, 2)).toBe(1);
    expect(minimapScale({ width: 0, height: 0 }, 96, 1)).toBe(1);
  });

  it('only uses whole device pixels', () => {
    for (const dpr of [1, 1.25, 2, 2.625, 3]) {
      for (const side of [320, 390, 430, 720, 900, 1080]) {
        const devicePixels = minimapScale({ width: side * 2, height: side }, 96, dpr) * dpr;
        expect(Math.abs(devicePixels - Math.round(devicePixels)), `${side}@${dpr}`).toBeLessThan(
          1e-9,
        );
      }
    }
  });
});

describe('spreadMarkers', () => {
  const bounds = { width: 100, height: 100 };

  it('leaves markers that do not overlap where they are', () => {
    const markers = [
      { id: 'a', x: 10, y: 10 },
      { id: 'b', x: 30, y: 12 },
    ];
    expect(spreadMarkers(markers, 8, bounds)).toEqual(markers);
  });

  it('parts overlapping markers along the axis where they are farthest apart', () => {
    const [a, b] = spreadMarkers(
      [
        { id: 'a', x: 50, y: 50 },
        { id: 'b', x: 54, y: 52 },
      ],
      8,
      bounds,
    );
    expect(a).toEqual({ id: 'a', x: 48, y: 50 });
    expect(b).toEqual({ id: 'b', x: 56, y: 52 });
  });

  it('parts markers on the same spot, and settles a cluster', () => {
    const spread = spreadMarkers(
      [
        { x: 50, y: 50 },
        { x: 50, y: 50 },
        { x: 52, y: 49 },
      ],
      6,
      bounds,
    );
    for (const [index, a] of spread.entries()) {
      for (const b of spread.slice(index + 1)) {
        expect(Math.abs(a.x - b.x) >= 6 - 1e-9 || Math.abs(a.y - b.y) >= 6 - 1e-9).toBe(true);
      }
    }
  });

  it('keeps markers within the minimap', () => {
    const spread = spreadMarkers(
      [
        { x: 1, y: 50 },
        { x: 2, y: 50 },
      ],
      8,
      bounds,
    );
    expect(spread.every(({ x }) => x >= 0 && x <= 100)).toBe(true);
  });
});
