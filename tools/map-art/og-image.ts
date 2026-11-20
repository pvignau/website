/**
 * The share preview, public/og-image.png (1200 × 630): the world printed
 * like a comic (comic.ts), framed like the cover of one. The hero stands on
 * the path in front of his house, the bridge leads to the other island, and
 * an inset panel shows the boat at the pier. Lettering from lettering.ts.
 */
import { HERO } from '../../src/engine/hero.ts';
import type { Rgb, Screen } from './comic.ts';
import { INK, PAPER, RED, SCREENS, YELLOW } from './comic.ts';
import type { Image } from './image.ts';
import { createImage } from './image.ts';
import type { Mask } from './lettering.ts';
import { createMask, letter } from './lettering.ts';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Image pixels per map pixel: the game seen at two screen pixels a map pixel. */
const ZOOM = 2;
/** Paper around the page, then the ink line of the panel. */
const MARGIN = 12;
const BORDER = 6;

interface Point {
  x: number;
  y: number;
}

interface Rect extends Point {
  width: number;
  height: number;
}

/** The main panel and the inset, in map pixels. */
const VIEW: Point = { x: 1414, y: 1556 };
const INSET_VIEW: Rect = { x: 1916, y: 1448, width: 172, height: 142 };
/** Where the hero stands: on the path, near the default spawn (src/maps/world.json). */
const HERO_FEET: Point = { x: 1690, y: 1828 };

/** Dots in the shadow of the title. */
const SHADOW_SCREEN: Screen = SCREENS.dots;
const SHADOW_DOTS: Rgb = PAPER;

/** Lettering. */
const TITLE = 'Pyve';
const KICKER = 'Le monde de';
const BALLOON = ['Un portfolio', 'à explorer !'];
const CAPTION = ['Pierre-Yves Vignau', 'Software architect'];
const ADDRESS = 'pyve.is-a.dev';

function fill(image: Image, rect: Rect, colour: Rgb): void {
  for (let y = Math.max(0, rect.y); y < Math.min(image.height, rect.y + rect.height); y += 1) {
    for (let x = Math.max(0, rect.x); x < Math.min(image.width, rect.x + rect.width); x += 1) {
      image.data.set([...colour, 255], (y * image.width + x) * 4);
    }
  }
}

/** Paints the pixels of `mask` with its top-left corner at (x, y). */
function paint(image: Image, mask: Mask, x: number, y: number, colour: Rgb): void {
  for (let row = 0; row < mask.height; row += 1) {
    for (let column = 0; column < mask.width; column += 1) {
      const [tx, ty] = [x + column, y + row];
      if (!mask.data[row * mask.width + column]) continue;
      if (tx < 0 || ty < 0 || tx >= image.width || ty >= image.height) continue;
      image.data.set([...colour, 255], (ty * image.width + tx) * 4);
    }
  }
}

/** `mask` grown by `radius` pixels all round (a disc), on a canvas grown as much. */
function grow(mask: Mask, radius: number): Mask {
  const out = createMask(mask.width + 2 * radius, mask.height + 2 * radius);
  const disc: Point[] = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx * dx + dy * dy <= radius * radius + radius) disc.push({ x: dx, y: dy });
    }
  }
  for (let y = 0; y < mask.height; y += 1) {
    for (let x = 0; x < mask.width; x += 1) {
      if (!mask.data[y * mask.width + x]) continue;
      for (const { x: dx, y: dy } of disc) {
        out.data[(y + radius + dy) * out.width + x + radius + dx] = 1;
      }
    }
  }
  return out;
}

/** Union of shapes placed at offsets, on a canvas of the given size. */
function union(width: number, height: number, parts: [Mask, number, number][]): Mask {
  const out = createMask(width, height);
  for (const [mask, ox, oy] of parts) {
    for (let y = 0; y < mask.height; y += 1) {
      for (let x = 0; x < mask.width; x += 1) {
        const [tx, ty] = [ox + x, oy + y];
        if (mask.data[y * mask.width + x] && tx >= 0 && ty >= 0 && tx < width && ty < height) {
          out.data[ty * width + tx] = 1;
        }
      }
    }
  }
  return out;
}

function shape(width: number, height: number, inside: (x: number, y: number) => boolean): Mask {
  const mask = createMask(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) if (inside(x + 0.5, y + 0.5)) mask.data[y * width + x] = 1;
  }
  return mask;
}

const ellipse = (width: number, height: number) =>
  shape(
    width,
    height,
    (x, y) => ((x - width / 2) / (width / 2)) ** 2 + ((y - height / 2) / (height / 2)) ** 2 <= 1,
  );

/** A triangle in a box of the given size. */
function triangle(width: number, height: number, [a, b, c]: [Point, Point, Point]): Mask {
  const side = (p: Point, q: Point, x: number, y: number) =>
    (q.x - p.x) * (y - p.y) - (q.y - p.y) * (x - p.x);
  return shape(width, height, (x, y) => {
    const [s1, s2, s3] = [side(a, b, x, y), side(b, c, x, y), side(c, a, x, y)];
    return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
  });
}

/** Image pixels per art pixel: screens printed on the image keep the grain of the map. */
const GRAIN = ZOOM * 2;

/** The pixels of `mask`, placed at (x, y) in the image, where `screen` prints its dots. */
function screened(mask: Mask, x: number, y: number, screen: Screen): Mask {
  const out = createMask(mask.width, mask.height);
  out.data.forEach((_, i) => {
    const [dx, dy] = [i % mask.width, Math.floor(i / mask.width)];
    const dot = screen(Math.floor((x + dx) / GRAIN), Math.floor((y + dy) / GRAIN));
    out.data[i] = mask.data[i] && dot ? 1 : 0;
  });
  return out;
}

/** Copies the art pixels of `view` (map pixels) from the printed world, enlarged to the image. */
function drawArt(image: Image, world: Image, origin: Point, view: Rect, at: Point): void {
  for (let y = 0; y < view.height * ZOOM; y += 1) {
    for (let x = 0; x < view.width * ZOOM; x += 1) {
      const ax = Math.floor((view.x + x / ZOOM - origin.x) / 2);
      const ay = Math.floor((view.y + y / ZOOM - origin.y) / 2);
      const from = (ay * world.width + ax) * 4;
      const [tx, ty] = [at.x + x, at.y + y];
      if (tx < 0 || ty < 0 || tx >= image.width || ty >= image.height) continue;
      image.data.set(world.data.subarray(from, from + 4), (ty * image.width + tx) * 4);
    }
  }
}

/** A box with an ink line and a hard ink shadow, like the captions of comic books. */
function box(image: Image, rect: Rect, colour: Rgb, line = 4, shadow = 6): void {
  fill(image, { ...rect, x: rect.x + shadow, y: rect.y + shadow }, INK);
  fill(image, rect, INK);
  fill(
    image,
    {
      x: rect.x + line,
      y: rect.y + line,
      width: rect.width - 2 * line,
      height: rect.height - 2 * line,
    },
    colour,
  );
}

/**
 * Renders the share image from the printed world (1 pixel per art pixel,
 * top-left corner at `origin`, map pixels) and the hero's first frame
 * facing down (24 × 36 map pixels).
 */
export function renderOgImage(world: Image, origin: Point, hero: Image): Image {
  const image = createImage(OG_WIDTH, OG_HEIGHT);
  fill(image, { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT }, PAPER);

  // The panel: ink line, then the art.
  const panel: Rect = {
    x: MARGIN,
    y: MARGIN,
    width: OG_WIDTH - 2 * MARGIN,
    height: OG_HEIGHT - 2 * MARGIN,
  };
  fill(image, panel, INK);
  const art: Rect = {
    x: panel.x + BORDER,
    y: panel.y + BORDER,
    width: panel.width - 2 * BORDER,
    height: panel.height - 2 * BORDER,
  };
  const view = { ...VIEW, width: art.width / ZOOM, height: art.height / ZOOM };
  drawArt(image, world, origin, view, art);

  // The hero, his shadow hatched like the others.
  const toImage = (p: Point): Point => ({
    x: art.x + (p.x - view.x) * ZOOM,
    y: art.y + (p.y - view.y) * ZOOM,
  });
  const feet = toImage(HERO_FEET);
  const shadowAt = { x: feet.x - 7 * ZOOM, y: feet.y - 3 * ZOOM };
  const shadow = screened(ellipse(14 * ZOOM, 5 * ZOOM), shadowAt.x, shadowAt.y, SCREENS.checker);
  paint(image, shadow, shadowAt.x, shadowAt.y, INK);
  const corner = { x: feet.x - HERO.anchor.x * ZOOM, y: feet.y - HERO.anchor.y * ZOOM };
  for (let y = 0; y < hero.height * ZOOM; y += 1) {
    for (let x = 0; x < hero.width * ZOOM; x += 1) {
      const from = (Math.floor(y / ZOOM) * hero.width + Math.floor(x / ZOOM)) * 4;
      if ((hero.data[from + 3] ?? 0) < 128) continue;
      image.data.set(
        [...hero.data.subarray(from, from + 3), 255],
        ((corner.y + y) * OG_WIDTH + corner.x + x) * 4,
      );
    }
  }

  // Inset panel: the boat at the pier.
  const inset: Rect = {
    x: art.x + art.width - INSET_VIEW.width * ZOOM - 22,
    y: art.y + 22,
    width: INSET_VIEW.width * ZOOM,
    height: INSET_VIEW.height * ZOOM,
  };
  fill(
    image,
    { x: inset.x - 14, y: inset.y - 14, width: inset.width + 28, height: inset.height + 28 },
    PAPER,
  );
  fill(
    image,
    { x: inset.x - 6, y: inset.y - 6, width: inset.width + 12, height: inset.height + 12 },
    INK,
  );
  drawArt(image, world, origin, INSET_VIEW, inset);

  // The title: yellow capitals, inked, over a red shadow shaded with dots.
  const title = grow(letter([TITLE], 15), 3);
  const titleAt = { x: art.x + 384, y: art.y + 62 };
  const outline = grow(title, 6);
  const drop = { x: titleAt.x - 6 + 14, y: titleAt.y - 6 + 14 };
  paint(image, grow(outline, 4), drop.x - 4, drop.y - 4, INK);
  paint(image, outline, drop.x, drop.y, RED);
  paint(image, screened(outline, drop.x, drop.y, SHADOW_SCREEN), drop.x, drop.y, SHADOW_DOTS);
  paint(image, outline, titleAt.x - 6, titleAt.y - 6, INK);
  paint(image, title, titleAt.x, titleAt.y, YELLOW);
  const kicker = letter([KICKER], 4);
  const kickerBox: Rect = {
    x: titleAt.x - 6,
    y: art.y + 14,
    width: kicker.width + 24,
    height: kicker.height + 18,
  };
  box(image, kickerBox, RED);
  paint(image, kicker, kickerBox.x + 12, kickerBox.y + 9, PAPER);

  // The hero's balloon.
  const words = letter(BALLOON, 4, 4);
  const body = ellipse(words.width + 96, words.height + 64);
  const balloonAt = { x: feet.x - body.width / 2 + 60, y: feet.y - 104 - body.height };
  const tail = triangle(body.width, body.height + 60, [
    { x: body.width * 0.3, y: body.height * 0.7 },
    { x: body.width * 0.45, y: body.height * 0.8 },
    { x: feet.x + 4 - balloonAt.x, y: feet.y - 80 - balloonAt.y },
  ]);
  const balloon = union(body.width, body.height + 60, [
    [body, 0, 0],
    [tail, 0, 0],
  ]);
  paint(image, grow(balloon, 4), balloonAt.x - 4, balloonAt.y - 4, INK);
  paint(image, balloon, balloonAt.x, balloonAt.y, PAPER);
  paint(
    image,
    words,
    balloonAt.x + (body.width - words.width) / 2,
    balloonAt.y + (body.height - words.height) / 2,
    INK,
  );

  // Caption and address.
  const [name, role] = [letter([CAPTION[0] ?? ''], 4), letter([CAPTION[1] ?? ''], 3)];
  const caption: Rect = {
    x: art.x + 16,
    y: art.y + art.height - name.height - role.height - 62,
    width: Math.max(name.width, role.width) + 36,
    height: name.height + role.height + 44,
  };
  box(image, caption, YELLOW);
  paint(image, name, caption.x + 18, caption.y + 16, INK);
  paint(image, role, caption.x + 18, caption.y + 28 + name.height, INK);
  const address = letter([ADDRESS], 3);
  const addressBox: Rect = {
    x: art.x + art.width - address.width - 52,
    y: art.y + art.height - address.height - 44,
    width: address.width + 30,
    height: address.height + 24,
  };
  box(image, addressBox, PAPER);
  paint(image, address, addressBox.x + 15, addressBox.y + 12, INK);
  return image;
}
