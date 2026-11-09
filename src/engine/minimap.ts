/**
 * Layout of a minimap, derived from the map itself: the ground the hero can
 * walk on (flood fill of the collision grid from the default spawn) and the
 * interactive objects, with some sea around, within the background image.
 * When the map changes in Tiled, or its image, the minimap follows.
 */
import { isSolidTile } from './collision';
import type { Rect, Size, Vec2 } from './geometry';
import { clamp } from './geometry';
import { interactionPoint } from './hero';
import type { GameMap } from './tiled';
import { findSpawn } from './tiled';

/** Sea kept around the walkable ground, in tiles. */
export const MINIMAP_MARGIN_TILES = 3;

/** Longest side of a minimap, in minimap pixels: past it, each pixel covers a block twice as wide. */
export const MINIMAP_MAX_PIXELS = 128;

/** Share of the shorter side of the screen the minimap aims at, between one and two CSS pixels per pixel. */
const MINIMAP_SCREEN_SHARE = 0.3;

export interface MinimapPlace<P extends string> {
  readonly placeId: P;
  /** Middle of the objects of the place, in minimap pixels. */
  readonly x: number;
  readonly y: number;
}

export interface MinimapLayout<P extends string> {
  /** Part of the map drawn, in map pixels; it lies within the background image. */
  readonly frame: Rect;
  /** Map pixels per minimap pixel, a power of two: each pixel of the minimap is the mean of a block this wide. */
  readonly blockSize: number;
  /** Size of the minimap, in minimap pixels. */
  readonly width: number;
  readonly height: number;
  /** One per place of the map, in the order of its objects. */
  readonly places: readonly MinimapPlace<P>[];
}

function union(rects: readonly Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function intersection(a: Rect, b: Rect): Rect | null {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return right > left && bottom > top
    ? { x: left, y: top, width: right - left, height: bottom - top }
    : null;
}

/** Bounding box, in map pixels, of the tiles the hero can reach on foot from the default spawn. */
export function walkableBounds(map: GameMap): Rect | null {
  const { collisions, tileSize } = map;
  const start = interactionPoint(findSpawn(map, null).position);
  const queue: [number, number][] = [
    [Math.floor(start.x / tileSize), Math.floor(start.y / tileSize)],
  ];
  const seen = new Uint8Array(collisions.columns * collisions.rows);
  let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
  // A for…of loop goes on over the tiles pushed meanwhile: a breadth-first flood fill.
  for (const [column, row] of queue) {
    // Tiles off the map count as solid.
    if (isSolidTile(collisions, column, row)) continue;
    const index = row * collisions.columns + column;
    if (seen[index] === 1) continue;
    seen[index] = 1;
    left = Math.min(left, column);
    top = Math.min(top, row);
    right = Math.max(right, column + 1);
    bottom = Math.max(bottom, row + 1);
    queue.push([column + 1, row], [column - 1, row], [column, row + 1], [column, row - 1]);
  }
  if (left === Infinity) return null;
  return {
    x: left * tileSize,
    y: top * tileSize,
    width: (right - left) * tileSize,
    height: (bottom - top) * tileSize,
  };
}

/** Smallest power of two that keeps the longest side of `size` within MINIMAP_MAX_PIXELS. */
function blockSizeFor(size: Size): number {
  let blockSize = 1;
  while (Math.max(size.width, size.height) / blockSize > MINIMAP_MAX_PIXELS) blockSize *= 2;
  return blockSize;
}

/** `rect` grown to whole blocks of the background image, then kept within it. */
function snapToBlocks(rect: Rect, background: Rect, blockSize: number): Rect {
  const axis = (start: number, length: number, origin: number, extent: number) => {
    const first = Math.floor((start - origin) / blockSize);
    const last = Math.min(
      Math.ceil((start + length - origin) / blockSize),
      Math.floor(extent / blockSize),
    );
    return { start: origin + first * blockSize, length: Math.max(1, last - first) * blockSize };
  };
  const x = axis(rect.x, rect.width, background.x, background.width);
  const y = axis(rect.y, rect.height, background.y, background.height);
  return { x: x.start, y: y.start, width: x.length, height: y.length };
}

export function minimapLayout<P extends string>(map: GameMap<P>): MinimapLayout<P> {
  const { background, tileSize } = map;
  const walkable = walkableBounds(map);
  const area = union([
    ...(walkable ? [walkable] : []),
    ...map.interactables.map((item) => item.rect),
  ]);
  const margin = MINIMAP_MARGIN_TILES * tileSize;
  const wanted =
    (area &&
      intersection(
        {
          x: area.x - margin,
          y: area.y - margin,
          width: area.width + 2 * margin,
          height: area.height + 2 * margin,
        },
        background,
      )) ??
    background;
  const blockSize = blockSizeFor(wanted);
  const frame = snapToBlocks(wanted, background, blockSize);

  const rectsByPlace = new Map<P, Rect[]>();
  for (const item of map.interactables) {
    if (item.placeId === null) continue;
    rectsByPlace.set(item.placeId, [...(rectsByPlace.get(item.placeId) ?? []), item.rect]);
  }
  const places = [...rectsByPlace].flatMap(([placeId, rects]) => {
    const box = union(rects);
    if (!box) return [];
    return [
      {
        placeId,
        x: (box.x + box.width / 2 - frame.x) / blockSize,
        y: (box.y + box.height / 2 - frame.y) / blockSize,
      },
    ];
  });

  return {
    frame,
    blockSize,
    width: frame.width / blockSize,
    height: frame.height / blockSize,
    places,
  };
}

/** Minimap pixel (whole column and row) of a map point; points off the frame stick to its edge. */
export function projectToMinimap(point: Vec2, layout: MinimapLayout<string>): Vec2 {
  const { frame, blockSize, width, height } = layout;
  return {
    x: clamp(Math.floor((point.x - frame.x) / blockSize), 0, width - 1),
    y: clamp(Math.floor((point.y - frame.y) / blockSize), 0, height - 1),
  };
}

/**
 * CSS pixels per minimap pixel: a whole number of device pixels, so the
 * minimap stays crisp, for a minimap about a third of the shorter side of the
 * screen wide, from one to two CSS pixels per pixel.
 */
export function minimapScale(viewport: Size, minimapWidth: number, devicePixelRatio = 1): number {
  const dpr = devicePixelRatio > 0 ? devicePixelRatio : 1;
  const shorter = Math.min(viewport.width, viewport.height);
  const ideal = clamp((shorter * MINIMAP_SCREEN_SHARE) / Math.max(1, minimapWidth), 1, 2);
  return Math.max(1, Math.round(ideal * dpr)) / dpr;
}

/**
 * Moves markers apart until no two of them overlap, as squares `gap` wide:
 * each overlapping pair shares the missing distance, along the axis where
 * they are already farthest apart. A few rounds settle the handful of places
 * of a map. Markers stay within `bounds`.
 */
export function spreadMarkers<T extends Vec2>(
  markers: readonly T[],
  gap: number,
  bounds: Size,
  rounds = 8,
): T[] {
  const xs = markers.map((marker) => marker.x);
  const ys = markers.map((marker) => marker.y);
  for (let round = 0; round < rounds; round += 1) {
    let moved = false;
    for (let a = 0; a < markers.length; a += 1) {
      for (let b = a + 1; b < markers.length; b += 1) {
        const dx = (xs[b] ?? 0) - (xs[a] ?? 0);
        const dy = (ys[b] ?? 0) - (ys[a] ?? 0);
        if (Math.abs(dx) >= gap || Math.abs(dy) >= gap) continue;
        moved = true;
        const [values, delta] = Math.abs(dx) >= Math.abs(dy) ? [xs, dx] : [ys, dy];
        const push = ((gap - Math.abs(delta)) / 2) * (delta < 0 ? -1 : 1);
        values[a] = (values[a] ?? 0) - push;
        values[b] = (values[b] ?? 0) + push;
      }
    }
    if (!moved) break;
  }
  return markers.map((marker, index) => ({
    ...marker,
    x: clamp(xs[index] ?? marker.x, 0, bounds.width),
    y: clamp(ys[index] ?? marker.y, 0, bounds.height),
  }));
}
