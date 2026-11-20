/**
 * Prints the map art like a Silver-Age comic book: process inks and a black
 * key plate on newsprint.
 *
 * - Separation: every colour of the art becomes a swatch of the colour guide
 *   (GUIDE), a flat tint or a Ben-Day screen, dots of one ink over another.
 *   The colours of the base images are separated in SEPARATIONS; sprites are
 *   drawn with the colours of the guide (COLOURS).
 * - Screens: ordered patterns on the art grid, in art pixels of the map. They
 *   run on from one image to the next (the world and the sea tile around it),
 *   stay crisp at whole scales, and repeat every 4 pixels: the minimap, which
 *   averages blocks of 8 × 8 art pixels, sees an even tint.
 * - Line work: what stands on the ground (the sea, grass, sand, floors) gets a
 *   one-pixel ink outline, and the land an ink line where it meets the water.
 * - Shadows that sprites cast (SHADOW) are hatched in ink.
 */
import type { Image } from './image.ts';

export type Rgb = readonly [number, number, number];

export function rgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1, 7), 16);
  return [value >> 16, (value >> 8) & 255, value & 255];
}

export function hex([r, g, b]: Rgb): string {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const toLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (light: number) => {
  const value = Math.min(1, Math.max(0, light));
  return Math.round(
    255 * (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055),
  );
};

const channels = (f: (channel: 0 | 1 | 2) => number): Rgb => [f(0), f(1), f(2)];

/** Newsprint, its shade, and the inks: the colours of the interface too. */
export const PAPER = rgb('#f6ecd2');
export const PAPER_SHADE = rgb('#e8d9b0');
export const INK = rgb('#14110f');
export const RED = rgb('#d7262e');
export const YELLOW = rgb('#ffd53d');
export const BLUE = rgb('#1e5aa8');
export const CYAN = rgb('#2fa8d8');
export const MAGENTA = rgb('#d9417f');

/** Share of the paper that each process ink covers, from 0 to 1. */
interface Densities {
  c?: number;
  m?: number;
  y?: number;
  k?: number;
}

/**
 * A tint printed with the process inks (cyan, magenta, yellow, black) over
 * each other on paper, as seen at arm's length: each ink filters the light
 * of the share of the paper its dots cover.
 */
export function overprint({ c = 0, m = 0, y = 0, k = 0 }: Densities): Rgb {
  const inks = [
    [c, CYAN],
    [m, MAGENTA],
    [y, YELLOW],
    [k, INK],
  ] as const;
  return channels((channel) => {
    const paper = toLinear(PAPER[channel]);
    const light = inks.reduce(
      (sum, [share, ink]) => sum * (1 - share + (share * toLinear(ink[channel])) / paper),
      paper,
    );
    return fromLinear(light);
  });
}

/** Where a screen prints its dots, at art pixel (x, y) of the map. */
export type Screen = (x: number, y: number) => boolean;

/** Every screen repeats after this many art pixels, across and down. */
export const SCREEN_PERIOD = 4;

export const SCREENS = {
  /** Ben-Day dots: one pixel in eight, on a lattice at 45°. */
  dots: (x: number, y: number) => ((x | y) & 1) === 0 && ((x + y) & 3) === 0,
  /** Denser dots: one pixel in four, on a square grid. */
  grid: (x: number, y: number) => ((x | y) & 1) === 0,
  /** One pixel in two. */
  checker: (x: number, y: number) => ((x + y) & 1) === 0,
  /** The inker's hatching: diagonal lines, one pixel in four. */
  hatch: (x: number, y: number) => ((x - y) & 3) === 0,
} satisfies Record<string, Screen>;

export interface Swatch {
  /** Flat tint, or the ink under the dots. */
  readonly ink: Rgb;
  /** Dots of another ink, printed over it. */
  readonly dots?: { readonly ink: Rgb; readonly screen: Screen };
  /**
   * Ground, land or water: what stands on it gets an ink outline, and land
   * an ink line where it meets water. A small patch of a ground colour among
   * other colours (a plank lit like the sand) is not ground: it prints as its
   * `inside` swatch.
   */
  readonly ground?: 'land' | 'water';
  readonly inside?: FlatName;
}

/** Tints of the guide besides the inks, all printed with the process inks. */
export const TINTS = {
  green: overprint({ c: 1, y: 1 }),
  forest: overprint({ c: 1, y: 1, k: 0.5 }),
  lime: overprint({ c: 0.25, y: 1 }),
  sage: overprint({ c: 0.5, y: 0.5 }),
  moss: overprint({ c: 0.75, y: 0.75, k: 0.25 }),
  orange: overprint({ m: 0.5, y: 1 }),
  wood: overprint({ c: 0.25, m: 0.75, y: 1 }),
  brown: overprint({ c: 0.5, m: 0.75, y: 1, k: 0.25 }),
  umber: overprint({ c: 0.75, m: 1, y: 1, k: 0.5 }),
  tan: overprint({ m: 0.25, y: 0.5 }),
  camel: overprint({ c: 0.25, m: 0.5, y: 0.75 }),
  stone: overprint({ k: 0.25 }),
  slate: overprint({ k: 0.5 }),
  iron: overprint({ k: 0.75 }),
  sky: overprint({ c: 0.5 }),
  lavender: overprint({ c: 0.75, m: 0.5 }),
  indigo: overprint({ c: 1, m: 1 }),
  navy: overprint({ c: 1, m: 0.75, k: 0.5 }),
  maroon: overprint({ c: 0.5, m: 1, y: 1 }),
  pink: overprint({ m: 0.5 }),
  purple: overprint({ c: 0.75, m: 1 }),
  plum: overprint({ c: 0.5, m: 0.75, k: 0.25 }),
  teal: overprint({ c: 1, y: 0.5 }),
};

const flat = (ink: Rgb): Swatch => ({ ink });
const screen = (ink: Rgb, dots: Rgb, pattern: Screen): Swatch => ({
  ink,
  dots: { ink: dots, screen: pattern },
});

/** Flat colours of the guide: the inks, then tints. */
const FLATS = {
  paper: flat(PAPER),
  shade: flat(PAPER_SHADE),
  ink: flat(INK),
  red: flat(RED),
  yellow: flat(YELLOW),
  blue: flat(BLUE),
  cyan: flat(CYAN),
  magenta: flat(MAGENTA),
  green: flat(TINTS.green),
  forest: flat(TINTS.forest),
  lime: flat(TINTS.lime),
  sage: flat(TINTS.sage),
  moss: flat(TINTS.moss),
  orange: flat(TINTS.orange),
  wood: flat(TINTS.wood),
  brown: flat(TINTS.brown),
  umber: flat(TINTS.umber),
  tan: flat(TINTS.tan),
  camel: flat(TINTS.camel),
  stone: flat(TINTS.stone),
  slate: flat(TINTS.slate),
  iron: flat(TINTS.iron),
  sky: flat(TINTS.sky),
  lavender: flat(TINTS.lavender),
  indigo: flat(TINTS.indigo),
  navy: flat(TINTS.navy),
  maroon: flat(TINTS.maroon),
  pink: flat(TINTS.pink),
  purple: flat(TINTS.purple),
  plum: flat(TINTS.plum),
  teal: flat(TINTS.teal),
};

export type FlatName = keyof typeof FLATS;

/** The colour guide: every colour the maps are printed with. */
export const GUIDE = {
  ...FLATS,
  // Outdoors: the sea and the shade of the cliffs, the crests of the waves.
  sea: { ...screen(CYAN, BLUE, SCREENS.dots), ground: 'water', inside: 'cyan' },
  seaShadow: { ...screen(CYAN, BLUE, SCREENS.checker), ground: 'water', inside: 'blue' },
  wave: { ...flat(CYAN), ground: 'water', inside: 'cyan' },
  foam: { ...flat(PAPER), ground: 'water', inside: 'paper' },
  // Grass, the shade of walls and trees on it, the sandy path.
  grass: { ...flat(TINTS.green), ground: 'land', inside: 'green' },
  grassShadow: { ...screen(TINTS.green, INK, SCREENS.hatch), ground: 'land', inside: 'forest' },
  sand: { ...screen(YELLOW, TINTS.orange, SCREENS.dots), ground: 'land', inside: 'yellow' },
  // Leaves in the light, like the grass the top of the trees is drawn with; leaves in the shade.
  leafLight: { ...screen(TINTS.green, YELLOW, SCREENS.grid), ground: 'land', inside: 'lime' },
  leafShadow: screen(TINTS.green, TINTS.forest, SCREENS.checker),
  // Indoors: floors of wood, carpets, tiles, and a wallpaper of sky.
  floor: { ...screen(TINTS.tan, TINTS.camel, SCREENS.dots), ground: 'land', inside: 'tan' },
  floorDark: {
    ...screen(TINTS.camel, TINTS.brown, SCREENS.dots),
    ground: 'land',
    inside: 'camel',
  },
  carpet: { ...screen(TINTS.lavender, BLUE, SCREENS.dots), ground: 'land', inside: 'lavender' },
  carpetDark: { ...screen(TINTS.navy, INK, SCREENS.dots), ground: 'land', inside: 'navy' },
  tile: { ...flat(TINTS.stone), ground: 'land', inside: 'stone' },
  tileDark: { ...flat(TINTS.slate), ground: 'land', inside: 'slate' },
  skyPaper: screen(PAPER, CYAN, SCREENS.grid),
} satisfies Record<string, Swatch>;

export type SwatchName = keyof typeof GUIDE;

const NAMES = Object.keys(GUIDE) as SwatchName[];
const swatch = (name: SwatchName): Swatch => GUIDE[name];

/** For sprite palettes: the flat colours of the guide, `#rrggbb`, by name. */
export const COLOURS = Object.fromEntries(
  Object.entries(FLATS).map(([name, { ink }]) => [name, hex(ink)]),
) as Readonly<Record<FlatName, string>>;

/** In a sprite palette, a shadow cast on what is below: hatched in ink when printed. */
export const SHADOW = '#00000040';

/** The colours of the base images (world.png, home.png, sea.png), separated by hand. */
export const SEPARATIONS: Readonly<Record<string, SwatchName>> = {
  // The sea, the crests of the waves, foam on the rocks, shade under the cliffs and the bridge.
  '#67e6d2': 'sea',
  '#7febda': 'wave',
  '#8fecde': 'wave',
  '#60dac7': 'wave',
  '#74d7c6': 'wave',
  '#a0f2e5': 'foam',
  '#bdfaf0': 'foam',
  '#95cfc3': 'foam',
  '#58cbb9': 'seaShadow',
  '#54ad9f': 'seaShadow',
  '#74c5b4': 'seaShadow',
  '#71b5a2': 'seaShadow',
  // Grass, its tufts, and the shade along walls and under trees.
  '#74c857': 'grass',
  '#6dc360': 'grass',
  '#62bb6b': 'grass',
  '#87c85d': 'grass',
  '#7aa852': 'grassShadow',
  '#4faf7b': 'grassShadow',
  '#65a46d': 'grassShadow',
  '#819d7a': 'grassShadow',
  '#72966b': 'forest',
  // Trees, from their light top to the dark under them.
  '#bdef6f': 'leafLight',
  '#9ec864': 'leafLight',
  '#56b742': 'green',
  '#51b25a': 'green',
  '#49a867': 'leafShadow',
  '#509770': 'leafShadow',
  '#498f7b': 'forest',
  '#6b9588': 'forest',
  '#417579': 'ink',
  '#2e757b': 'ink',
  // The sandy path and its pebbles.
  '#f8c984': 'sand',
  '#f8d49f': 'sand',
  '#f1ce8e': 'sand',
  '#e7c87e': 'sand',
  '#e0b870': 'sand',
  '#f7bc83': 'sand',
  '#f1b183': 'sand',
  // Wood, and the earth of the cliffs.
  '#efb171': 'orange',
  '#e6a271': 'orange',
  '#df9a69': 'orange',
  '#d38658': 'wood',
  '#ca8054': 'wood',
  '#c78c59': 'wood',
  '#b5754d': 'wood',
  '#b56e4b': 'wood',
  '#a85f46': 'brown',
  '#a9592d': 'brown',
  '#a0654d': 'brown',
  '#9f7257': 'brown',
  '#90634c': 'brown',
  '#915841': 'brown',
  '#984826': 'maroon',
  '#983b11': 'maroon',
  // Walls and stone.
  '#f1e6d6': 'paper',
  '#d3cdc4': 'shade',
  '#baafa7': 'stone',
  '#b6978e': 'stone',
  '#a79796': 'stone',
  '#99a49b': 'stone',
  '#989375': 'stone',
  '#8e8f8e': 'slate',
  '#8c8566': 'slate',
  '#897558': 'slate',
  '#7a7b64': 'slate',
  // Roofs, red and slate blue, and windows.
  '#d75278': 'red',
  '#c65377': 'red',
  '#ae5965': 'maroon',
  '#b54c74': 'maroon',
  '#a74a71': 'maroon',
  '#8a9bc9': 'lavender',
  '#7486b8': 'lavender',
  '#6b8fc6': 'blue',
  '#6273a6': 'blue',
  '#5f6a8f': 'blue',
  '#536294': 'blue',
  '#444f7c': 'indigo',
  '#5299d7': 'cyan',

  // The house: walls, seen from above and in front.
  '#5b3138': 'ink',
  '#422433': 'ink',
  '#221c1a': 'ink',
  '#422f16': 'ink',
  '#613c38': 'umber',
  '#704b4a': 'maroon',
  '#613d31': 'umber',
  '#654135': 'umber',
  '#765042': 'brown',
  '#7e594c': 'brown',
  // Wood panelling.
  '#b09775': 'tan',
  '#806949': 'camel',
  '#776041': 'brown',
  '#6a5841': 'brown',
  '#6a5538': 'brown',
  // Floors: light boards of the children's rooms, dark boards, carpets, tiles.
  '#a8906c': 'floor',
  '#b49b77': 'floor',
  '#ae9572': 'floor',
  '#a08662': 'floor',
  '#796755': 'floorDark',
  '#806b56': 'floorDark',
  '#806952': 'floorDark',
  '#485d84': 'carpet',
  '#4d6288': 'carpet',
  '#3f4459': 'carpetDark',
  '#474d63': 'carpetDark',
  '#978d7d': 'tile',
  '#8b8273': 'tileDark',
  // Wallpapers: sky and clouds, yellow with red dots, sage stripes.
  '#7fb2d8': 'skyPaper',
  '#6a9bc2': 'sky',
  '#a9cfea': 'paper',
  '#f2efe3': 'paper',
  '#d8d0c0': 'paper',
  '#e6c86b': 'yellow',
  '#edd38a': 'yellow',
  '#c9a64f': 'orange',
  '#e48f58': 'red',
  '#93a68e': 'sage',
  '#86997f': 'moss',
  '#7b8e76': 'moss',
  // The office: dark walls, a strip of light.
  '#2e3450': 'navy',
  '#3a4166': 'navy',
  '#252a42': 'ink',
  '#1d2033': 'ink',
};

const BY_COLOUR = new Map(
  (Object.keys(FLATS) as FlatName[]).map((name) => [hex(FLATS[name].ink), name]),
);

/** The swatch of a colour of the art: from SEPARATIONS, or a flat colour of the guide. */
export function separation(colour: Rgb): SwatchName | undefined {
  const key = hex(colour);
  return SEPARATIONS[key] ?? BY_COLOUR.get(key);
}

function oklab([r, g, b]: Rgb): [number, number, number] {
  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/**
 * The flat colour of the guide nearest to a colour it does not know, by eye
 * (OKLab, lightness counting double): new art prints in the guide's colours
 * until its colours are separated by hand.
 */
export function nearest(colour: Rgb): FlatName {
  const [L, a, b] = oklab(colour);
  let best: FlatName = 'ink';
  let distance = Infinity;
  for (const name of BY_COLOUR.values()) {
    const [L2, a2, b2] = oklab(FLATS[name].ink);
    const d = 2 * (L - L2) ** 2 + (a - a2) ** 2 + (b - b2) ** 2;
    if (d < distance) [best, distance] = [name, d];
  }
  return best;
}

/** Mean colour of a swatch from afar, as the minimap shows it. */
export function seen({ ink, dots }: Swatch): Rgb {
  if (!dots) return ink;
  let cover = 0;
  for (let y = 0; y < SCREEN_PERIOD; y += 1) {
    for (let x = 0; x < SCREEN_PERIOD; x += 1) if (dots.screen(x, y)) cover += 1;
  }
  const share = cover / SCREEN_PERIOD ** 2;
  return channels((c) =>
    fromLinear(toLinear(ink[c]) * (1 - share) + toLinear(dots.ink[c]) * share),
  );
}

/** Smallest patch of ground colours that counts as ground, in art pixels. */
const MIN_GROUND = 256;
/** Kinds of ground, by pixel. */
const [OFF, LAND, WATER] = [0, 1, 2];

/**
 * Prints `image`, whose top-left pixel is art pixel `origin` of the map.
 * `shadows`, of the same size if given, holds the shadows that sprites cast,
 * in its alpha channel.
 */
export function printComic(image: Image, origin: { x: number; y: number }, shadows?: Image): Image {
  const { width, height, data } = image;
  const size = width * height;
  const index = new Map(NAMES.map((name, i) => [name, i]));
  const cellOf = (name: SwatchName) => index.get(name) ?? 0;
  const swatchAt = (cell: number) => swatch(NAMES[cell] ?? 'ink');
  const INK_CELL = cellOf('ink');

  // Separation: a swatch for each pixel, -1 where the image is transparent.
  const cells = new Int16Array(size).fill(-1);
  const known = new Map<number, number>();
  for (let i = 0; i < size; i += 1) {
    if (data[i * 4 + 3] === 0) continue;
    const colour: Rgb = [data[i * 4] ?? 0, data[i * 4 + 1] ?? 0, data[i * 4 + 2] ?? 0];
    const key = (colour[0] << 16) | (colour[1] << 8) | colour[2];
    let cell = known.get(key);
    if (cell === undefined) {
      cell = cellOf(separation(colour) ?? nearest(colour));
      known.set(key, cell);
    }
    cells[i] = cell;
  }

  // Ground: the large patches of ground swatches, four-connected.
  const ground = new Uint8Array(size);
  const visited = new Uint8Array(size);
  const kind = (i: number) => {
    const cell = cells[i] ?? -1;
    return cell < 0 ? undefined : swatchAt(cell).ground;
  };
  const neighbours = (i: number) => {
    const [x, y] = [i % width, Math.floor(i / width)];
    return [
      x > 0 ? i - 1 : -1,
      x < width - 1 ? i + 1 : -1,
      y > 0 ? i - width : -1,
      y < height - 1 ? i + width : -1,
    ].filter((j) => j >= 0);
  };
  for (let start = 0; start < size; start += 1) {
    if (visited[start] || !kind(start)) continue;
    const patch = [start];
    visited[start] = 1;
    // The loop goes on over the pixels pushed while it runs.
    for (const i of patch) {
      for (const j of neighbours(i)) {
        if (!visited[j] && kind(j)) {
          visited[j] = 1;
          patch.push(j);
        }
      }
    }
    for (const i of patch) {
      const own = swatchAt(cells[i] ?? 0);
      if (patch.length >= MIN_GROUND) ground[i] = own.ground === 'water' ? WATER : LAND;
      else cells[i] = cellOf(own.inside ?? 'ink');
    }
  }

  // Line work: ink where things meet the ground, and where land meets water.
  const lines = Int16Array.from(cells);
  for (let i = 0; i < size; i += 1) {
    if ((cells[i] ?? -1) < 0 || ground[i] === WATER) continue;
    const touches = (test: (j: number) => boolean) => neighbours(i).some(test);
    const outlined =
      ground[i] === OFF
        ? touches((j) => ground[j] !== OFF || (cells[j] ?? -1) < 0)
        : touches((j) => ground[j] === WATER);
    if (outlined) lines[i] = INK_CELL;
  }

  // Inks and screens; hatching over cast shadows.
  const out: Image = { width, height, data: Uint8Array.from(data) };
  for (let i = 0; i < size; i += 1) {
    const cell = lines[i] ?? -1;
    if (cell < 0) continue;
    const [x, y] = [origin.x + (i % width), origin.y + Math.floor(i / width)];
    const { ink, dots } = swatchAt(cell);
    const shaded = cell !== INK_CELL && (shadows?.data[i * 4 + 3] ?? 0) > 0 && SCREENS.hatch(x, y);
    const colour = shaded ? INK : dots?.screen(x, y) ? dots.ink : ink;
    out.data.set([...colour, 255], i * 4);
  }
  return out;
}
