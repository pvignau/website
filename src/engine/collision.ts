import type { Rect, Vec2 } from './geometry';
import { translateRect } from './geometry';

/**
 * Solid tiles of a map, built from the Tiled `collisions` layer.
 * Cells are stored row by row, like Tiled stores tile layer data.
 */
export interface CollisionGrid {
  readonly columns: number;
  readonly rows: number;
  readonly tileSize: number;
  readonly solid: Uint8Array;
}

/** Tolerance for half-open edges: a box ending exactly on a tile boundary does not touch it. */
const EPSILON = 1e-6;

export function createCollisionGrid(
  columns: number,
  rows: number,
  tileSize: number,
  cells: ArrayLike<number>,
): CollisionGrid {
  if (cells.length !== columns * rows) {
    throw new Error(`Collision data has ${cells.length} cells, expected ${columns * rows}.`);
  }
  const solid = new Uint8Array(columns * rows);
  for (let index = 0; index < solid.length; index += 1) {
    solid[index] = (cells[index] ?? 0) === 0 ? 0 : 1;
  }
  return { columns, rows, tileSize, solid };
}

/** Tiles outside the map count as solid, so the hero can never leave it. */
export function isSolidTile(grid: CollisionGrid, column: number, row: number): boolean {
  if (column < 0 || row < 0 || column >= grid.columns || row >= grid.rows) return true;
  return grid.solid[row * grid.columns + column] === 1;
}

export function rectHitsSolid(grid: CollisionGrid, rect: Rect): boolean {
  const { tileSize } = grid;
  const firstColumn = Math.floor(rect.x / tileSize);
  const lastColumn = Math.floor((rect.x + rect.width - EPSILON) / tileSize);
  const firstRow = Math.floor(rect.y / tileSize);
  const lastRow = Math.floor((rect.y + rect.height - EPSILON) / tileSize);
  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      if (isSolidTile(grid, column, row)) return true;
    }
  }
  return false;
}

type Axis = 'x' | 'y';

/**
 * Moves `box` along one axis and stops it flush against the first solid tile.
 * The move is cut into steps of half a tile so that a fast move never tunnels
 * through a one-tile wall. Returns the distance actually travelled.
 */
export function sweepAxis(grid: CollisionGrid, box: Rect, delta: number, axis: Axis): number {
  if (delta === 0) return 0;
  // A box already overlapping a wall (bad spawn data) may always move, so it can get out.
  if (rectHitsSolid(grid, box)) return delta;

  const { tileSize } = grid;
  const sign = Math.sign(delta);
  const maxStep = tileSize / 2;
  let travelled = 0;

  while (Math.abs(travelled) < Math.abs(delta)) {
    const step = sign * Math.min(maxStep, Math.abs(delta) - Math.abs(travelled));
    const next =
      axis === 'x'
        ? translateRect(box, travelled + step, 0)
        : translateRect(box, 0, travelled + step);
    if (!rectHitsSolid(grid, next)) {
      travelled += step;
      continue;
    }
    // Blocked during this step: stop on the boundary of the tile the leading edge entered.
    const start = axis === 'x' ? box.x : box.y;
    const length = axis === 'x' ? box.width : box.height;
    if (sign > 0) {
      const leadingEdge = start + length + travelled + step;
      const boundary = Math.floor((leadingEdge - EPSILON) / tileSize) * tileSize;
      return Math.max(travelled, boundary - (start + length));
    }
    const leadingEdge = start + travelled + step;
    const boundary = (Math.floor(leadingEdge / tileSize) + 1) * tileSize;
    return Math.min(travelled, boundary - start);
  }
  return travelled;
}

/**
 * Resolves a move axis by axis (X first, then Y), so pushing diagonally
 * against a wall keeps sliding along it.
 */
export function moveAndSlide(grid: CollisionGrid, box: Rect, dx: number, dy: number): Vec2 {
  const x = sweepAxis(grid, box, dx, 'x');
  const y = sweepAxis(grid, translateRect(box, x, 0), dy, 'y');
  return { x, y };
}
