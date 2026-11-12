/**
 * Sprites in pixel art, written as text: one character per pixel of the
 * 16 px art grid (one map tile is 16 × 16 characters, drawn at 32 × 32 map
 * pixels). `.` is transparent; every other character is a colour of the
 * sprite's palette, `#rrggbb` or `#rrggbbaa`.
 */
import type { Image } from './image.ts';
import { createImage } from './image.ts';

export type Palette = Readonly<Record<string, string>>;

/** Parses the text of a sprite: rows of equal length, indentation and blank edges ignored. */
export function parseSprite(name: string, palette: Palette, text: string): Image {
  const rows = text
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row !== '');
  const width = rows[0]?.length ?? 0;
  if (width === 0) throw new Error(`Sprite ${name} is empty.`);
  const image = createImage(width, rows.length);
  rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new Error(`Sprite ${name}: row ${y} has ${row.length} pixels, expected ${width}.`);
    }
    for (let x = 0; x < width; x += 1) {
      const char = row.charAt(x);
      if (char === '.') continue;
      const colour = palette[char];
      if (colour === undefined) throw new Error(`Sprite ${name}: no colour for "${char}".`);
      const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(colour);
      if (!match) throw new Error(`Sprite ${name}: "${colour}" is not #rrggbb or #rrggbbaa.`);
      const value = parseInt(match[1] ?? '', 16);
      image.data.set(
        [value >> 16, (value >> 8) & 255, value & 255, parseInt(match[2] ?? 'ff', 16)],
        (y * width + x) * 4,
      );
    }
  });
  return image;
}
