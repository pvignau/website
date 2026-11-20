import { describe, expect, it } from 'vitest';
import type { Mask } from './lettering.ts';
import { CELL_HEIGHT, letter, textWidth } from './lettering.ts';

/** The mask as rows of `#` and `.`. */
const rows = (mask: Mask) =>
  Array.from({ length: mask.height }, (_, y) =>
    Array.from({ length: mask.width }, (_, x) => (mask.data[y * mask.width + x] ? '#' : '.')).join(
      '',
    ),
  );

describe('letter', () => {
  it('writes capitals of 5 × 7 pixels, one pixel apart, whatever the case', () => {
    expect(rows(letter(['li'], 1))).toEqual([
      '#.....###',
      '#......#.',
      '#......#.',
      '#......#.',
      '#......#.',
      '#......#.',
      '#####.###',
    ]);
    expect(textWidth('Pyve')).toBe(4 * 5 + 3);
  });

  it('scales every pixel to a square', () => {
    const mask = letter(['.'], 3);
    expect(rows(mask)).toEqual(['###', '###', '###']);
  });

  it('puts accents above the capitals and centres the lines', () => {
    const mask = letter(['À', 'I'], 1);
    // A whole first line and its leading, then the accent space and the capital of the second.
    expect(mask.height).toBe(CELL_HEIGHT + 2 + 3 + 7);
    expect(rows(mask).slice(0, 4)).toEqual(['.#...', '..#..', '.....', '.###.']);
    expect(rows(mask).at(-1)).toBe('.###.');
  });

  it('refuses a character it cannot letter', () => {
    expect(() => letter(['€'], 1)).toThrow(/No letter for "€"/);
  });
});
