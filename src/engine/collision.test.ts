import { describe, expect, it } from 'vitest';
import {
  createCollisionGrid,
  isSolidTile,
  moveAndSlide,
  rectHitsSolid,
  sweepAxis,
} from './collision';

const T = 32;

/** Builds a grid from rows of `#` (solid) and `.` (free). */
function grid(...rows: string[]) {
  const cells = rows.flatMap((row) => Array.from(row, (cell) => (cell === '#' ? 1 : 0)));
  return createCollisionGrid(rows[0]?.length ?? 0, rows.length, T, cells);
}

describe('createCollisionGrid', () => {
  it('marks every non-zero Tiled gid as solid', () => {
    const map = createCollisionGrid(3, 1, T, [0, 3759, 1]);
    expect([...map.solid]).toEqual([0, 1, 1]);
  });

  it('rejects data that does not match the map size', () => {
    expect(() => createCollisionGrid(2, 2, T, [0, 0, 0])).toThrow(/3 cells, expected 4/);
  });
});

describe('isSolidTile', () => {
  const map = grid('.#', '..');

  it('reads cells row by row', () => {
    expect(isSolidTile(map, 1, 0)).toBe(true);
    expect(isSolidTile(map, 0, 1)).toBe(false);
  });

  it('treats everything outside the map as solid', () => {
    expect(isSolidTile(map, -1, 0)).toBe(true);
    expect(isSolidTile(map, 0, 2)).toBe(true);
    expect(isSolidTile(map, 2, 1)).toBe(true);
  });
});

describe('rectHitsSolid', () => {
  const map = grid('...', '.#.', '...');

  it('detects any overlap with a solid tile', () => {
    expect(rectHitsSolid(map, { x: 20, y: 20, width: 14, height: 14 })).toBe(true);
  });

  it('uses half-open edges: touching a wall is not hitting it', () => {
    expect(rectHitsSolid(map, { x: 18, y: 40, width: 14, height: 8 })).toBe(false);
    expect(rectHitsSolid(map, { x: 40, y: 24, width: 14, height: 8 })).toBe(false);
  });
});

describe('sweepAxis', () => {
  const map = grid('.....', '..#..', '.....');
  const box = { x: 4, y: 36, width: 14, height: 8 };

  it('moves freely when nothing is in the way', () => {
    expect(sweepAxis(map, box, 20, 'x')).toBe(20);
    expect(sweepAxis(map, box, 0, 'x')).toBe(0);
  });

  it('stops flush against a wall in every direction', () => {
    expect(sweepAxis(map, box, 100, 'x')).toBe(64 - (4 + 14));
    expect(sweepAxis(map, { ...box, x: 110 }, -100, 'x')).toBe(96 - 110);
    expect(sweepAxis(map, { ...box, x: 70, y: 2 }, 100, 'y')).toBe(32 - (2 + 8));
    expect(sweepAxis(map, { ...box, x: 70, y: 80 }, -100, 'y')).toBe(64 - 80);
  });

  it('never tunnels through a one-tile wall, even with a huge step', () => {
    expect(sweepAxis(map, box, 10_000, 'x')).toBe(46);
  });

  it('lets a box stuck inside a wall move out', () => {
    expect(sweepAxis(map, { ...box, x: 70 }, -30, 'x')).toBe(-30);
  });
});

describe('moveAndSlide', () => {
  // A horizontal wall below the hero.
  const map = grid('.....', '.....', '#####');

  it('slides along a wall when moving diagonally into it', () => {
    const box = { x: 10, y: 50, width: 14, height: 8 };
    const move = moveAndSlide(map, box, 5, 10);
    expect(move).toEqual({ x: 5, y: 64 - 58 });
    const blocked = moveAndSlide(map, { ...box, y: 56 }, 5, 5);
    expect(blocked).toEqual({ x: 5, y: 0 });
  });

  it('resolves X before Y, so the hero slips past a corner', () => {
    const corner = grid('.....', '..#..', '.....');
    const above = { x: 70, y: 20, width: 14, height: 8 };
    expect(moveAndSlide(corner, above, 0, 20)).toEqual({ x: 0, y: 32 - 28 });
    expect(moveAndSlide(corner, above, -20, 20)).toEqual({ x: -20, y: 20 });
  });
});
