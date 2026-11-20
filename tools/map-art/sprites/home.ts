/** Sprites of the house: the furniture of its seven rooms. */
import { COLOURS as C, SHADOW } from '../comic.ts';
import type { Image } from '../image.ts';
import type { Palette } from '../sprite.ts';
import { parseSprite } from '../sprite.ts';

/** Indoor colours, from the colour guide (comic.ts): furniture over the floors of the house. */
const INDOOR: Palette = {
  k: C.ink, // outlines, like the walls
  _: SHADOW, // shadow on the floor
  C: C.orange, // wood, lit top
  c: C.wood, // wood
  b: C.brown, // wood, shaded
  a: C.umber, // wood, dark
  g: C.forest, // leaves, dark
  G: C.green, // leaves
  L: C.lime, // leaves, lit
  Q: C.orange, // pot rim
  P: C.wood, // pot
  p: C.brown, // pot, shaded
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

/** Double bed: two pillows, a quilted duvet. */
const BED_DOUBLE = `
  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  kCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCk
  kcccccccccccccccccccccccccccccccccck
  kbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbk
  kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSk
  kSkkkkkkkkkkkkkkkSSkkkkkkkkkkkkkkkSk
  kSkWWWWWWWWWWWWWkSSkWWWWWWWWWWWWWkSk
  kSkWWWWWWWWWWWWWkSSkWWWWWWWWWWWWWkSk
  kSkwwwwwwwwwwwwwkSSkwwwwwwwwwwwwwkSk
  kSkkkkkkkkkkkkkkkSSkkkkkkkkkkkkkkkSk
  kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSk
  kEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kBBBBBBBBDBBBBBBBBDBBBBBBBBDBBBBBBBk
  kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk
  kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk
  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  kbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbk
  kaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaak
  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  ____________________________________
`;

/** Bedside table and its lamp. */
const NIGHTSTAND = `
  ....kkkk....
  ...kYYYYk...
  ..kYYYYYYk..
  ..kyyyyyyk..
  ...kkmmkk...
  kkkkkkkkkkkk
  kCCCCCCCCCCk
  kbbbbbbbbbbk
  kcccccccccck
  kccccCCcccck
  kcccccccccck
  kbbbbbbbbbbk
  kkkkkkkkkkkk
  .k........k.
  ____________
`;

/** Wardrobe: two doors with panels. */
const WARDROBE = `
  kkkkkkkkkkkkkkkkkkkkkk
  kCCCCCCCCCCCCCCCCCCCCk
  kbbbbbbbbbbbbbbbbbbbbk
  kbcccccccckkccccccccbk
  kbcaaaaaackkcaaaaaacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaaaaaackkcaaaaaacbk
  kbcccccccCkkCcccccccbk
  kbcccccccckkccccccccbk
  kbcaaaaaackkcaaaaaacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaccccackkcaccccacbk
  kbcaaaaaackkcaaaaaacbk
  kbcccccccckkccccccccbk
  kbbbbbbbbbbbbbbbbbbbbk
  kkkkkkkkkkkkkkkkkkkkkk
  .k..................k.
  ______________________
`;

/** Toy chest, a star on its side. */
const TOY_CHEST = `
  .kkkkkkkkkkkkkk.
  kRRRRRRRRRRRRRRk
  kRrrrrrrrrrrrrRk
  kkkkkkkkkkkkkkkk
  kcccccccYcccccck
  kccccccYYYccccck
  kccccYYYYYYYccck
  kcccccYYYYYcccck
  kcccccYYcYYcccck
  kbbbbbbbbbbbbbbk
  kkkkkkkkkkkkkkkk
  .k............k.
  ________________
`;

/** Building blocks. */
const TOY_BLOCKS = `
  ..kkkk..
  ..kRRk..
  ..kRRk..
  kkkkkkkk
  kBBkkGGk
  kBBkkGGk
  kkkkkkkk
  .______.
`;

/** A ball. */
const TOY_BALL = `
  .kkkk.
  kRRRWk
  kWWWWk
  kRRRRk
  .kkkk.
  .____.
`;

/** A toy car. */
const TOY_CAR = `
  ...kkkk..
  ..kBWWBk.
  kkBBBBBBk
  kBBBBBBBk
  .kk...kk.
  ._______.
`;

/** Teddy bear. */
const TEDDY = `
  .kk..kk.
  kTTkkTTk
  kTTTTTTk
  kTkTTkTk
  kTTttTTk
  .kTTTTk.
  kTTTTTTk
  kTkTTkTk
  .kk..kk.
`;

/** Poster: a rocket in the stars. */
const POSTER_ROCKET = `
  kkkkkkkkkk
  kNNNNNNNYk
  kNNNwwNNNk
  kNNwwwwNNk
  kNNwRRwNNk
  kNNwwwwNNk
  kNRwwwwRNk
  kNRwwwwRNk
  kNNNOONNNk
  kYNNYYNNNk
  kNNNNNNNYk
  kkkkkkkkkk
`;

/** Poster: a dinosaur. */
const POSTER_DINO = `
  kkkkkkkkkk
  kLLLLLLLLk
  kLLLLLggLk
  kLLLLgggek
  kLLLLggLLk
  kLgLggggLk
  kLLggggLLk
  kLLLggggLk
  kLLLgLLgLk
  kGGGGGGGGk
  kGGGGGGGGk
  kkkkkkkkkk
`;

/** Little table: a drawing, crayons. */
const DRAWING_TABLE = `
  kkkkkkkkkkkkkkkk
  kCCWWWWWCCCCCCCk
  kCCWRWYWCCRYBGCk
  kCCWWBWWCCCCCCCk
  kCCWWWWWCCCCCCCk
  kbbbbbbbbbbbbbbk
  kkkkkkkkkkkkkkkk
  kb.k........k.bk
  kb.k........k.bk
  kk.kk......kk.kk
  ________________
`;

/** Gaming desk: a wide screen in game, the PC and its RGB, the keyboard, a headset. */
const GAMING_DESK = `
  kkkkkkkkkkkkkkkkkkkkkk..kkkkkkkk
  kooooooooooooooooooook..kxxxxxxk
  kosswwsssssssssYssssok..kxkkkkxk
  koswwwwsssssssssssssok..kxkRYkxk
  kosssssssssssYssssssok..kxkGBkxk
  kossssggsssRssssggssok..kxkkkkxk
  kosssggggsRRssssgggsok..kxkkkkxk
  kosgggggggggggggggggok..kxkMRkxk
  kouuuuuuuuuuuuuuuuuuok..kxkYGkxk
  kooooooooooooooooooook..kxkkkkxk
  kkkkkkkkkkkkkkkkkkkkkk..kxRYGBMk
  .........kook...........kxxxxlxk
  kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  kNNNkkkkkkkkkkkkNNNNNNkkkkNNNNNk
  kNNNkRYGBMRYGBMkNNNNNNkhhkNNNNNk
  kNNNkkkkkkkkkkkkNNNNNNkkkkNNNNNk
  kddddddddddddddddddddddddddddddk
  kd____________________________dk
  kd____________________________dk
  kd____________________________dk
  kk............................kk
  ________________________________
`;

/** Shelf of games: boxes, a controller, a handheld. */
const GAME_SHELF = `
  kkkkkkkkkkkkkkkkkkkkkkkk
  kCCCCCCCCCCCCCCCCCCCCCCk
  kbbbbbbbbbbbbbbbbbbbbbbk
  kbaaaaaaaaaaaaaaaaaaaabk
  kbaa1a22a33a4a5a66a1aabk
  kbaa1a22a33a4a5a66a1aabk
  kbaa1a22a33a4a5a66a1aabk
  kbaa1a22a33a4a5a66a1aabk
  kbccccccccccccccccccccbk
  kbbbbbbbbbbbbbbbbbbbbbbk
  kbaaaaaaaaaaaaaaaaaaaabk
  kbaxxxxxaaaZZZZaaGaaaabk
  kbaxRxGxaaaZssZaGGGaaabk
  kbaxxxxxaaaZZZZaagaaaabk
  kbccccccccccccccccccccbk
  kbbbbbbbbbbbbbbbbbbbbbbk
  kbaaaaaaaaaaaaaaaaaaaabk
  kba5555a3333a2222a666abk
  kba1111a4444a6666a222abk
  kbccccccccccccccccccccbk
  kkkkkkkkkkkkkkkkkkkkkkkk
  ________________________
`;

/** Coat rack by the door: a coat and a scarf. */
const COAT_RACK = `
  .....kk.....
  ..kkkbbkkk..
  .kGk.bb.kRk.
  kGGGkbbkRRRk
  kGgGkbbkRrRk
  kGGGkbbkRRRk
  kGgGkbbkRrRk
  kGGGkbbkkRk.
  kGgGkbb.kRk.
  kGGGkbb..k..
  .kkkkbb.....
  .....bb.....
  .....bb.....
  .....bb.....
  .....bb.....
  .....bb.....
  ...kkbbkk...
  ..kb....bk..
  .__________.
`;

/** Doormat. */
const DOORMAT = `
  kkkkkkkkkkkkkkkkkkkkkkkkkkkk
  kMMMMMMMMMMMMMMMMMMMMMMMMMMk
  kMmmmmmmmmmmmmmmmmmmmmmmmmMk
  kMmmmMMMmmmMMMmmmMMMmmmMMMMk
  kMmmmmmmmmmmmmmmmmmmmmmmmmMk
  kMMMMMMMMMMMMMMMMMMMMMMMMMMk
  kkkkkkkkkkkkkkkkkkkkkkkkkkkk
`;

/** Framed picture: the sea and the sun. */
const FRAME_SEA = `
  kkkkkkkkkkkk
  kFFFFFFFFFFk
  kFssssssYsFk
  kFsssssYYYFk
  kFssssssYsFk
  kFSSSSSSSSFk
  kFSSwwSSSSFk
  kFSSSSSwwSFk
  kFFFFFFFFFFk
  kkkkkkkkkkkk
`;

/** Framed picture: flowers in a vase. */
const FRAME_FLOWERS = `
  kkkkkkkkkkkk
  kFFFFFFFFFFk
  kFpRppYpppFk
  kFRRRpYYRpFk
  kFpgRgpgRRFk
  kFppgggpgpFk
  kFppbbbbppFk
  kFpppbbpppFk
  kFFFFFFFFFFk
  kkkkkkkkkkkk
`;

/** Framed picture: a mountain. */
const FRAME_MOUNTAIN = `
  kkkkkkkkkkkk
  kFFFFFFFFFFk
  kFsssssssYFk
  kFsssWssssFk
  kFssWWWsssFk
  kFsgWggWssFk
  kFgggggggWFk
  kFGGGGGGGGFk
  kFFFFFFFFFFk
  kkkkkkkkkkkk
`;

/** Play mat: a road round a pond, on the grass. */
function playMat(width: number, height: number): string {
  const rows: string[] = [];
  for (let y = 0; y < height; y += 1) {
    let row = '';
    for (let x = 0; x < width; x += 1) {
      const edge = Math.min(x, width - 1 - x, y, height - 1 - y);
      const road = edge >= 3 && edge <= 5;
      const middle = edge === 4;
      const pond = Math.abs(x - (width - 1) / 2) / 2.2 + Math.abs(y - (height - 1) / 2) < 3.5;
      if (edge === 0) row += 'G';
      else if (road) row += middle && (x + y) % 4 < 2 ? 'w' : 'r';
      else if (pond && edge > 5) row += 'b';
      else row += 'g';
    }
    rows.push(row);
  }
  return rows.join('\n');
}

/** Round rug in rainbow rings. */
function rainbowRug(width: number, height: number): string {
  const rings = ['1', '2', '3', '4', '5'];
  const rows: string[] = [];
  for (let y = 0; y < height; y += 1) {
    let row = '';
    for (let x = 0; x < width; x += 1) {
      const d = Math.hypot(
        (x - (width - 1) / 2) / (width / 2),
        (y - (height - 1) / 2) / (height / 2),
      );
      row += d >= 1 ? '.' : (rings[Math.floor(d * rings.length)] ?? '5');
    }
    rows.push(row);
  }
  return rows.join('\n');
}

/** Runner along the corridor: border, small diamonds, fringes at both ends. */
function runner(width: number, height: number): string {
  const rows: string[] = [];
  for (let y = 0; y < height; y += 1) {
    let row = '';
    for (let x = 0; x < width; x += 1) {
      const edge = Math.min(x - 1, width - 2 - x, y, height - 1 - y);
      const diamond = Math.abs(((x - 6) % 12) - 6) / 2 + Math.abs(y - (height - 1) / 2);
      if (x === 0 || x === width - 1) row += y % 2 === 0 ? 'f' : '.';
      else if (edge === 0) row += 'r';
      else if (edge === 1) row += 'y';
      else if (Math.round(diamond) === 2) row += 'y';
      else row += 'R';
    }
    rows.push(row);
  }
  return rows.join('\n');
}

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

/** Spines of books and games, on the shelves. */
const BOOKS: Palette = {
  1: C.red,
  2: C.blue,
  3: C.yellow,
  4: C.green,
  5: C.paper,
  6: C.purple,
};

/** Sheets and pillows of the beds. */
const SHEETS: Palette = { S: C.paper, W: C.paper, w: C.shade };

/** Small framed pictures of the corridor and the bedroom. */
const FRAMES: Palette = {
  ...INDOOR,
  F: C.wood,
  s: C.sky,
  Y: C.yellow,
  S: C.cyan,
  w: C.paper,
  p: C.paper,
  R: C.red,
  g: C.green,
  b: C.blue,
  W: C.paper,
  G: C.forest,
};

export const HOME_SPRITES: Readonly<Record<string, Image>> = {
  'tv-frame': parseSprite(
    'tv-frame',
    { ...INDOOR, F: C.tan, s: C.sky, h: C.yellow, n: C.green, N: C.forest, S: C.cyan, w: C.paper },
    TV_FRAME,
  ),
  'tv-stand': parseSprite('tv-stand', { ...INDOOR, x: C.ink, X: C.iron, l: C.cyan }, TV_STAND),
  bookshelf: parseSprite('bookshelf', { ...INDOOR, ...BOOKS, y: C.camel, Y: C.tan }, BOOKSHELF),
  'plant-big': parseSprite('plant-big', INDOOR, PLANT_BIG),
  'plant-small': parseSprite('plant-small', INDOOR, PLANT_SMALL),
  rug: parseSprite(
    'rug',
    { ...INDOOR, f: C.paper, r: C.maroon, R: C.red, y: C.orange, Y: C.yellow },
    rug(56, 24),
  ),
  sofa: parseSprite('sofa', { ...INDOOR, t: C.navy, u: C.teal, v: C.cyan, V: C.sky }, SOFA),
  'helmet-cabinet': parseSprite(
    'helmet-cabinet',
    { ...INDOOR, m: C.red, M: C.maroon, w: C.paper, z: C.navy, Z: C.sky },
    HELMET_CABINET,
  ),
  'poster-moto': parseSprite(
    'poster-moto',
    { ...INDOOR, Y: C.paper, m: C.red, M: C.maroon },
    POSTER_MOTO,
  ),
  desk: parseSprite(
    'desk',
    {
      ...INDOOR,
      o: C.ink,
      q: C.navy,
      e: C.lime,
      i: C.cyan,
      j: C.magenta,
      Y: C.yellow,
      X: C.stone,
      x: C.slate,
      W: C.paper,
      w: C.stone,
    },
    DESK,
  ),
  chair: parseSprite('chair', { ...INDOOR, x: C.ink, X: C.iron, m: C.red }, CHAIR),
  'bed-blue': parseSprite(
    'bed-blue',
    { ...INDOOR, ...SHEETS, E: C.sky, B: C.blue, D: C.navy },
    BED,
  ),
  'bed-orange': parseSprite(
    'bed-orange',
    { ...INDOOR, ...SHEETS, E: C.yellow, B: C.orange, D: C.wood },
    BED,
  ),
  'bed-double': parseSprite(
    'bed-double',
    { ...INDOOR, ...SHEETS, E: C.sage, B: C.moss, D: C.forest },
    BED_DOUBLE,
  ),
  nightstand: parseSprite(
    'nightstand',
    { ...INDOOR, Y: C.yellow, y: C.orange, m: C.slate },
    NIGHTSTAND,
  ),
  wardrobe: parseSprite('wardrobe', INDOOR, WARDROBE),
  'rug-sage': parseSprite(
    'rug-sage',
    { ...INDOOR, f: C.paper, r: C.moss, R: C.sage, y: C.paper, Y: C.paper },
    rug(48, 18),
  ),
  'toy-chest': parseSprite(
    'toy-chest',
    { ...INDOOR, R: C.red, r: C.maroon, Y: C.yellow },
    TOY_CHEST,
  ),
  'toy-blocks': parseSprite(
    'toy-blocks',
    { ...INDOOR, R: C.red, B: C.blue, G: C.green },
    TOY_BLOCKS,
  ),
  'toy-ball': parseSprite('toy-ball', { ...INDOOR, R: C.red, W: C.paper }, TOY_BALL),
  'toy-car': parseSprite('toy-car', { ...INDOOR, B: C.blue, W: C.sky }, TOY_CAR),
  teddy: parseSprite('teddy', { ...INDOOR, T: C.wood, t: C.tan }, TEDDY),
  'poster-rocket': parseSprite(
    'poster-rocket',
    { ...INDOOR, N: C.navy, w: C.paper, R: C.red, O: C.orange, Y: C.yellow },
    POSTER_ROCKET,
  ),
  'poster-dino': parseSprite(
    'poster-dino',
    { ...INDOOR, L: C.yellow, g: C.green, e: C.ink, G: C.forest },
    POSTER_DINO,
  ),
  'drawing-table': parseSprite(
    'drawing-table',
    { ...INDOOR, W: C.paper, R: C.red, Y: C.yellow, B: C.blue, G: C.green },
    DRAWING_TABLE,
  ),
  'play-mat': parseSprite(
    'play-mat',
    { G: C.forest, g: C.green, r: C.slate, w: C.paper, b: C.cyan },
    playMat(40, 22),
  ),
  'rug-rainbow': parseSprite(
    'rug-rainbow',
    { 1: C.yellow, 2: C.orange, 3: C.red, 4: C.purple, 5: C.blue },
    rainbowRug(30, 18),
  ),
  'gaming-desk': parseSprite(
    'gaming-desk',
    {
      ...INDOOR,
      o: C.ink,
      s: C.sky,
      w: C.paper,
      Y: C.yellow,
      g: C.green,
      R: C.red,
      u: C.brown,
      N: C.iron,
      d: C.ink,
      G: C.green,
      B: C.blue,
      M: C.magenta,
      h: C.red,
      x: C.ink,
      l: C.cyan,
    },
    GAMING_DESK,
  ),
  'office-chair': parseSprite(
    'office-chair',
    { ...INDOOR, x: C.iron, X: C.slate, m: C.iron },
    CHAIR,
  ),
  'game-shelf': parseSprite(
    'game-shelf',
    { ...INDOOR, ...BOOKS, x: C.ink, R: C.red, G: C.green, Z: C.iron, s: C.sky },
    GAME_SHELF,
  ),
  'coat-rack': parseSprite(
    'coat-rack',
    { ...INDOOR, G: C.green, g: C.forest, R: C.red, r: C.maroon },
    COAT_RACK,
  ),
  doormat: parseSprite('doormat', { ...INDOOR, M: C.brown, m: C.camel }, DOORMAT),
  runner: parseSprite(
    'runner',
    { ...INDOOR, f: C.paper, r: C.purple, R: C.plum, y: C.yellow },
    runner(176, 10),
  ),
  'frame-sea': parseSprite('frame-sea', FRAMES, FRAME_SEA),
  'frame-flowers': parseSprite('frame-flowers', FRAMES, FRAME_FLOWERS),
  'frame-mountain': parseSprite('frame-mountain', FRAMES, FRAME_MOUNTAIN),
};
