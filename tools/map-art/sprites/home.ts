/** Sprites of the house: the furniture. */
import type { Image } from '../image.ts';
import type { Palette } from '../sprite.ts';
import { parseSprite } from '../sprite.ts';

/** Indoor colours: furniture over the brown and blue floors of the house. */
const INDOOR: Palette = {
  k: '#221c1a', // outlines, like the walls
  _: '#00000040', // shadow on the floor
  C: '#d9a46b', // wood, lit top
  c: '#c08552', // wood
  b: '#9a6236', // wood, shaded
  a: '#6e4128', // wood, dark
  g: '#2f6b35', // leaves, dark
  G: '#4f9a4a', // leaves
  L: '#82c96a', // leaves, lit
  Q: '#e08a5e', // pot rim
  P: '#c9714a', // pot
  p: '#a5532f', // pot, shaded
};

/** The TV that shows paintings, after Samsung's The Frame: an island at sea, of course. */
const TV_FRAME = `
  kkkkkkkkkkkkkkkkkkkkkkkkkk
  kFFFFFFFFFFFFFFFFFFFFFFFFk
  kFssssssssssssssssshhsssFk
  kFsssssssssssssssshhhhssFk
  kFssssssssssssssssshhsssFk
  kFssssssnnnsssssssssssssFk
  kFSSSSSnnnnnSSSSSSSnnSSSFk
  kFSSSSnNNNNNnSSSSSnNNnSSFk
  kFSSSSSSSSSSSSSSSSSSSSSSFk
  kFSSSSSSwwSSSSSSSSSwwSSSFk
  kFFFFFFFFFFFFFFFFFFFFFFFFk
  kkkkkkkkkkkkkkkkkkkkkkkkkk
`;

/** Low sideboard under the TV, a game console and its controller on top. */
const TV_STAND = `
  ...kkkkkkkkk....................
  ...kXXXXXXXk..........kkkkkk....
  ...kxxxxxxxk.........kxXXXXxk...
  ...kxxlxxxxk.........kkkkkkkk...
  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  kCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCk
  kcccccccccccccccccccccccccccccck
  kbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbk
  kbcccccccccccccaacccccccccccccbk
  kbccccccccccccCaaCccccccccccccbk
  kbcccccccccccccaacccccccccccccbk
  kbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbk
  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  ._k__________________________k_.
`;

/** Bookshelf: books of every colour, a plant and a box on the bottom shelf. */
const BOOKSHELF = `
  kkkkkkkkkkkkkkkkkkkkkkkk
  kCCCCCCCCCCCCCCCCCCCCCCk
  kbbbbbbbbbbbbbbbbbbbbbbk
  kbaaaaaaaaaaaaaaaaaaaabk
  kba11a33aaa566aa11a44abk
  kba11233a44566aa11244abk
  kba11233a44566aa11244abk
  kba11233a44566aa11244abk
  kba11233a44566aa11244abk
  kbccccccccccccccccccccbk
  kbbbbbbbbbbbbbbbbbbbbbbk
  kbaaaaaaaaaaaaaaaaaaaabk
  kba55aaa22aaaa44aaa33abk
  kba5566a22311a4466a33abk
  kba5566a22311a4466a33abk
  kba5566a22311a4466a33abk
  kbccccccccccccccccccccbk
  kbbbbbbbbbbbbbbbbbbbbbbk
  kbaaaaaaaaaaaaaaaaaaaabk
  kbaagGgaaaaaaaayyyyyaabk
  kbaaPPPaaaaaaaayYYYyaabk
  kbaaPPPaaaaaaaayyyyyaabk
  kbccccccccccccccccccccbk
  kbbbbbbbbbbbbbbbbbbbbbbk
  kkkkkkkkkkkkkkkkkkkkkkkk
  .______________________.
`;

const PLANT_BIG = `
  ......gg......
  ....gGGGGg....
  ...gGLLGGGg...
  ..gGLLGGgGGg..
  .gGGLGGgGLLGg.
  .gGGGGgGGLGGg.
  gGLGGgGGGGgGGg
  gGLLGgGGLLGGGg
  gGGGGgGGLGGgGg
  .gGGgGGGGGgGg.
  .ggGGgGGgGGgg.
  ...ggggggggg..
  ...kQQQQQQQk..
  ...kpPPPPPpk..
  ....kpPPPpk...
  ....kpPPPpk...
  .....kkkkk....
  ....______....
`;

const PLANT_SMALL = `
  ....G.....
  ..G.GG.G..
  .GGLGGGGG.
  GGLGgGLGGg
  .gGGgGGgg.
  ..gggggg..
  ..kQQQQk..
  ..kpPPpk..
  ...kPPk...
  ...kkkk...
  ..______..
`;

/** Sofa seen from behind, facing the TV. */
const SOFA = `
  .kkkk....................................kkkk.
  kvVVvk..................................kvVVvk
  kvvvvkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkvvvvk
  kuuuukVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVkuuuuk
  kuuuukvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvkuuuuk
  kuuuukuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukuuuuk
  kuuuukuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukuuuuk
  kuuuukuuuuuuuutuuuuuuuuuuuuuuutuuuuuuuuukuuuuk
  kuuuukuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukuuuuk
  kuuuukuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukuuuuk
  kuuuukuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukuuuuk
  kuuuukuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukuuuuk
  kttttkttttttttttttttttttttttttttttttttttkttttk
  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  .k..k....................................k..k.
  ______________________________________________
`;

/** By the door: a shoe cabinet and the motorcycle helmet. */
const HELMET_CABINET = `
  ...kkkkkkkk...
  ..kmmmmmmmmk..
  .kmwmmmmmmMMk.
  .kmwmzzzzzzzk.
  .kmmmzZZzzzzk.
  .kmmmzzzzzzzk.
  .kMmmmmmmmmMk.
  ..kMMMMMMMMk..
  kkkkkkkkkkkkkk
  kCCCCCCCCCCCCk
  kbbbbbbbbbbbbk
  kbccccbbccccbk
  kbccCcbbcCccbk
  kbccccbbccccbk
  kbbbbbbbbbbbbk
  kbccccbbccccbk
  kbccCcbbcCccbk
  kbccccbbccccbk
  kkkkkkkkkkkkkk
  .k..........k.
  ______________
`;

/** A framed motorcycle poster. */
const POSTER_MOTO = `
  kkkkkkkkkkkkkkkkkk
  kYYYYYYYYYYYYYYYYk
  kYYYYYYYYYmmYYYYYk
  kYYYYmmmmmmmYYYYYk
  kYYYmmMMMMmYmYYYYk
  kYYkkkYYYYYYkkkYYk
  kYkYYYkYYYYkYYYkYk
  kYkYkYkYYYYkYkYkYk
  kYkYYYkYYYYkYYYkYk
  kYYkkkYYYYYYkkkYYk
  kYYYYYYYYYYYYYYYYk
  kkkkkkkkkkkkkkkkkk
`;

/** The dev setup: two screens of code, a keyboard, the script keypad and a mug. */
const DESK = `
  ..kkkkkkkkkkkkkkk..kkkkkkkkkkkkkkk..
  ..koooooooooooook..koooooooooooook..
  ..koqqqqqqqqqqqok..koqqqqqqqqqqqok..
  ..koqeeeqiiqqqqok..koqjjjjqqqqqqok..
  ..koqqiiiieeqqqok..koqqYYYYYqqqqok..
  ..koqqqeeeeqqqqok..koqqqiiqeeeqqok..
  ..koqjjjqqqqqqqok..koqeeeeqqqqqqok..
  ..koqqqqiiiiqqqok..koqqjjjjjjqqqok..
  ..koqqqqqqqqqqqok..koqqqqqqqqqqqok..
  ..koooooooooooook..koooooooooooook..
  ........kok..............kok........
  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  kCCCXXXXXXXXXXCCCCXXXCCWCCCCCCCCCCCk
  kcccxxxxxxxxxxccccxxxccwccccccccccck
  kbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbk
  kb_____________________kccccccccccck
  kb_____________________kcccccCccccck
  kb_____________________kbbbbbbbbbbbk
  kb_____________________kcccccCccccck
  kb_____________________kccccccccccck
  kk.....................kkkkkkkkkkkkk
  ____________________________________
`;

/** Desk chair, seen from behind. */
const CHAIR = `
  ...kkkkkk...
  ..kxmmmmxk..
  ..kxxxxxxk..
  .kxmxxxxmxk.
  .kxmxxxxmxk.
  .kxmxxxxmxk.
  .kxxxxxxxxk.
  kkkkkkkkkkkk
  kXk......kXk
  .k..kXXk..k.
  ....kXXk....
  ..kkkkkkkk..
  .kX.kXXk.Xk.
  ____________
`;

const BED = `
  kkkkkkkkkkkkkkkkkkkkkkkk
  kCCCCCCCCCCCCCCCCCCCCCCk
  kcccccccccccccccccccccck
  kbbbbbbbbbbbbbbbbbbbbbbk
  kSSSSSSSSSSSSSSSSSSSSSSk
  kSSkkkkkkkkkkkkkkkkkkSSk
  kSkWWWWWWWWWWWWWWWWWWkSk
  kSkWWWWWWWWWWWWWWWWWWkSk
  kSkwwwwwwwwwwwwwwwwwwkSk
  kSSkkkkkkkkkkkkkkkkkkSSk
  kSSSSSSSSSSSSSSSSSSSSSSk
  kSSSSSSSSSSSSSSSSSSSSSSk
  kEEEEEEEEEEEEEEEEEEEEEEk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kEEEEEEEEEEEEEEEEEEEEEEk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kEEEEEEEEEEEEEEEEEEEEEEk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kEEEEEEEEEEEEEEEEEEEEEEk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kBBBBBBBBBBBBBBBBBBBBBBk
  kDDDDDDDDDDDDDDDDDDDDDDk
  kDDDDDDDDDDDDDDDDDDDDDDk
  kkkkkkkkkkkkkkkkkkkkkkkk
  kbbbbbbbbbbbbbbbbbbbbbbk
  kaaaaaaaaaaaaaaaaaaaaaak
  kkkkkkkkkkkkkkkkkkkkkkkk
  ________________________
`;

/** Rug in front of the sofa: red field, ochre border and diamond, fringes on the short sides. */
function rug(width: number, height: number): string {
  const rows: string[] = [];
  const [cx, cy] = [(width - 1) / 2, (height - 1) / 2];
  for (let y = 0; y < height; y += 1) {
    let row = '';
    for (let x = 0; x < width; x += 1) {
      const edge = Math.min(x - 1, width - 2 - x, y, height - 1 - y);
      const diamond = Math.abs(x - cx) / 2 + Math.abs(y - cy);
      if (x === 0 || x === width - 1) row += y % 2 === 0 ? 'f' : '.';
      else if (edge === 0 || edge === 2) row += 'r';
      else if (edge === 1) row += 'y';
      else if (Math.round(diamond) === 6) row += 'y';
      else if (diamond < 2.5) row += 'Y';
      else row += 'R';
    }
    rows.push(row);
  }
  return rows.join('\n');
}

export const HOME_SPRITES: Readonly<Record<string, Image>> = {
  'tv-frame': parseSprite(
    'tv-frame',
    {
      ...INDOOR,
      F: '#d9b27c',
      s: '#9fd4ee',
      h: '#f2cf5b',
      n: '#6cae5b',
      N: '#4a8a4a',
      S: '#4f95c9',
      w: '#bfe6f5',
    },
    TV_FRAME,
  ),
  'tv-stand': parseSprite(
    'tv-stand',
    { ...INDOOR, x: '#2a2a33', X: '#4a4d5c', l: '#6ad0ff' },
    TV_STAND,
  ),
  bookshelf: parseSprite(
    'bookshelf',
    {
      ...INDOOR,
      1: '#b84a4a',
      2: '#4a72b8',
      3: '#d9b44a',
      4: '#5a9e5a',
      5: '#e6e0d0',
      6: '#8a5aa8',
      y: '#c9a35a',
      Y: '#e0c07a',
    },
    BOOKSHELF,
  ),
  'plant-big': parseSprite('plant-big', INDOOR, PLANT_BIG),
  'plant-small': parseSprite('plant-small', INDOOR, PLANT_SMALL),
  rug: parseSprite(
    'rug',
    {
      ...INDOOR,
      f: '#e6dcc6',
      r: '#7e3434',
      R: '#a8473f',
      y: '#d6a85a',
      Y: '#e8c47a',
    },
    rug(56, 24),
  ),
  sofa: parseSprite(
    'sofa',
    { ...INDOOR, t: '#2f5f5b', u: '#3f7f7a', v: '#5aa39a', V: '#79c2b6' },
    SOFA,
  ),
  'helmet-cabinet': parseSprite(
    'helmet-cabinet',
    {
      ...INDOOR,
      m: '#c43c3c',
      M: '#8f2a2a',
      w: '#f2ede4',
      z: '#2b3a4a',
      Z: '#5a7a96',
    },
    HELMET_CABINET,
  ),
  'poster-moto': parseSprite(
    'poster-moto',
    { ...INDOOR, Y: '#efe1b8', m: '#c43c3c', M: '#8f2a2a' },
    POSTER_MOTO,
  ),
  desk: parseSprite(
    'desk',
    {
      ...INDOOR,
      o: '#1d1f2b',
      q: '#1e2a3a',
      e: '#7fd47f',
      i: '#6fa8ff',
      j: '#ff8fb3',
      Y: '#ffd479',
      X: '#c8c8d0',
      x: '#8a8a96',
      W: '#e8e2d6',
      w: '#b9b2a6',
    },
    DESK,
  ),
  chair: parseSprite('chair', { ...INDOOR, x: '#2a2a33', X: '#4a4d5c', m: '#c43c3c' }, CHAIR),
  bed: parseSprite(
    'bed',
    {
      ...INDOOR,
      S: '#e8e2d6',
      W: '#f6f2ea',
      w: '#d6cfc2',
      E: '#6f9ad6',
      B: '#3f6fb0',
      D: '#2f5590',
    },
    BED,
  ),
};
