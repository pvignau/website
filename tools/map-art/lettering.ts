/**
 * Comic lettering in pixels, for the share image (og-image.ts): capitals of
 * 5 × 7 pixels, like the hand lettering of comic books, written as text the
 * way sprites are. Accents sit in three rows above the capitals.
 */

/** Pixels of a shape: 1 where it is drawn. */
export interface Mask {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

export function createMask(width: number, height: number): Mask {
  return { width, height, data: new Uint8Array(width * height) };
}

/** Rows of 7 pixels, `#` drawn. */
const GLYPHS: Readonly<Record<string, string>> = {
  A: '.###. #...# #...# ##### #...# #...# #...#',
  B: '####. #...# #...# ####. #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #...# .###.',
  D: '####. #...# #...# #...# #...# #...# ####.',
  E: '##### #.... #.... ####. #.... #.... #####',
  F: '##### #.... #.... ####. #.... #.... #....',
  G: '.###. #...# #.... #.### #...# #...# .####',
  H: '#...# #...# #...# ##### #...# #...# #...#',
  I: '### .#. .#. .#. .#. .#. ###',
  J: '..### ...#. ...#. ...#. ...#. #..#. .##..',
  K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#',
  L: '#.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#',
  N: '#...# #...# ##..# #.#.# #..## #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# .###.',
  P: '####. #...# #...# ####. #.... #.... #....',
  Q: '.###. #...# #...# #...# #.#.# #..#. .##.#',
  R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.',
  T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# .###.',
  V: '#...# #...# #...# #...# .#.#. .#.#. ..#..',
  W: '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.',
  X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
  Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..',
  Z: '##### ....# ...#. ..#.. .#... #.... #####',
  0: '.###. #...# #..## #.#.# ##..# #...# .###.',
  1: '.#. ##. .#. .#. .#. .#. ###',
  2: '.###. #...# ....# ...#. ..#.. .#... #####',
  3: '####. ....# ....# .###. ....# ....# ####.',
  4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.',
  5: '##### #.... ####. ....# ....# #...# .###.',
  6: '.###. #.... #.... ####. #...# #...# .###.',
  7: '##### ....# ...#. ..#.. .#... .#... .#...',
  8: '.###. #...# #...# .###. #...# #...# .###.',
  9: '.###. #...# #...# .#### ....# ....# .###.',
  ' ': '... ... ... ... ... ... ...',
  '.': '. . . . . . #',
  ',': '.. .. .. .. .. .# #.',
  '-': '... ... ... ### ... ... ...',
  '·': '. . . # . . .',
  '!': '# # # # # . #',
  '?': '.###. #...# ....# ...#. ..#.. ..... ..#..',
  "'": '# # . . . . .',
  ':': '. . # . . # .',
  '/': '..# ..# .#. .#. .#. #.. #..',
};

/** Accents, two rows above a capital, with a row between them. */
const ACCENTS: Readonly<Record<string, [string, string]>> = {
  À: ['A', '.#... ..#..'],
  É: ['E', '...#. ..#..'],
  È: ['E', '.#... ..#..'],
  Ê: ['E', '..#.. .#.#.'],
};

/** Rows of a glyph cell: three for accents, seven for the capital. */
export const CELL_HEIGHT = 10;
const CAP_TOP = 3;

function glyph(char: string): Mask {
  const [base, accent] = ACCENTS[char] ?? [char, undefined];
  const rows = GLYPHS[base]?.split(' ');
  if (!rows) throw new Error(`No letter for "${char}".`);
  const width = rows[0]?.length ?? 0;
  const mask = createMask(width, CELL_HEIGHT);
  const draw = (lines: string[], top: number) =>
    lines.forEach((line, y) => {
      for (let x = 0; x < line.length; x += 1) {
        if (line[x] === '#') mask.data[(top + y) * width + x] = 1;
      }
    });
  draw(rows, CAP_TOP);
  if (accent) draw(accent.split(' '), 0);
  return mask;
}

/** Width of `text` in font pixels, letters one pixel apart. */
export function textWidth(text: string): number {
  let width = -1;
  for (const char of text.toUpperCase()) width += glyph(char).width + 1;
  return Math.max(0, width);
}

/**
 * Lines of lettering, uppercased and centred, `scale` pixels per font
 * pixel, `leading` font pixels between lines; cropped to the drawn pixels.
 */
export function letter(lines: readonly string[], scale: number, leading = 2): Mask {
  const width = Math.max(...lines.map(textWidth));
  const full = createMask(width, lines.length * (CELL_HEIGHT + leading));
  lines.forEach((line, row) => {
    let x = Math.floor((width - textWidth(line)) / 2);
    for (const char of line.toUpperCase()) {
      const shape = glyph(char);
      for (let y = 0; y < shape.height; y += 1) {
        for (let dx = 0; dx < shape.width; dx += 1) {
          if (shape.data[y * shape.width + dx]) {
            full.data[(row * (CELL_HEIGHT + leading) + y) * width + x + dx] = 1;
          }
        }
      }
      x += shape.width + 1;
    }
  });
  // Crop the empty rows (accent space, leading), then scale up.
  let [top, bottom] = [full.height, -1];
  for (let y = 0; y < full.height; y += 1) {
    if (full.data.subarray(y * width, (y + 1) * width).some(Boolean)) {
      top = Math.min(top, y);
      bottom = y;
    }
  }
  const height = bottom - top + 1;
  const out = createMask(width * scale, height * scale);
  for (let y = 0; y < out.height; y += 1) {
    for (let x = 0; x < out.width; x += 1) {
      out.data[y * out.width + x] =
        full.data[(top + Math.floor(y / scale)) * width + Math.floor(x / scale)] ?? 0;
    }
  }
  return out;
}
