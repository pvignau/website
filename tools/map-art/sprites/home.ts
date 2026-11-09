/** Sprites of the house: the furniture of its seven rooms. */
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
  kcccccccccccccck
  kccccccYYcccccck
  kcccccYYYYccccck
  kccccccYYcccccck
  kccccccYYcccccck
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

/** Small framed pictures of the corridor and the bedroom. */
const FRAMES: Palette = {
  ...INDOOR,
  F: '#c08552',
  s: '#9fd4ee',
  Y: '#f2cf5b',
  S: '#4f95c9',
  w: '#bfe6f5',
  p: '#f4e6c8',
  R: '#d0504a',
  g: '#4f9a4a',
  b: '#4a72b8',
  W: '#f2efe3',
  G: '#4a8a4a',
};

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
  'bed-blue': parseSprite(
    'bed-blue',
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
  'bed-orange': parseSprite(
    'bed-orange',
    {
      ...INDOOR,
      S: '#e8e2d6',
      W: '#f6f2ea',
      w: '#d6cfc2',
      E: '#f2cf5b',
      B: '#e8894a',
      D: '#c96b33',
    },
    BED,
  ),
  'bed-double': parseSprite(
    'bed-double',
    {
      ...INDOOR,
      S: '#e8e2d6',
      W: '#f6f2ea',
      w: '#d6cfc2',
      E: '#a7b98f',
      B: '#8fa577',
      D: '#75895f',
    },
    BED_DOUBLE,
  ),
  nightstand: parseSprite(
    'nightstand',
    { ...INDOOR, Y: '#f4e2a8', y: '#d9c27c', m: '#8a8a96' },
    NIGHTSTAND,
  ),
  wardrobe: parseSprite('wardrobe', INDOOR, WARDROBE),
  'rug-sage': parseSprite(
    'rug-sage',
    { ...INDOOR, f: '#e6dcc6', r: '#6f8564', R: '#8fa577', y: '#e6dcc6', Y: '#f2efe3' },
    rug(48, 18),
  ),
  'toy-chest': parseSprite(
    'toy-chest',
    { ...INDOOR, R: '#d0504a', r: '#a63c38', Y: '#f2cf5b' },
    TOY_CHEST,
  ),
  'toy-blocks': parseSprite(
    'toy-blocks',
    { ...INDOOR, R: '#d0504a', B: '#4a72b8', G: '#5a9e5a' },
    TOY_BLOCKS,
  ),
  'toy-ball': parseSprite('toy-ball', { ...INDOOR, R: '#d0504a', W: '#f2efe3' }, TOY_BALL),
  'toy-car': parseSprite('toy-car', { ...INDOOR, B: '#4a72b8', W: '#cfe6f5' }, TOY_CAR),
  teddy: parseSprite('teddy', { ...INDOOR, T: '#b07a4a', t: '#d9b088' }, TEDDY),
  'poster-rocket': parseSprite(
    'poster-rocket',
    { ...INDOOR, N: '#26305a', w: '#f2efe3', R: '#d0504a', O: '#e8894a', Y: '#f2cf5b' },
    POSTER_ROCKET,
  ),
  'poster-dino': parseSprite(
    'poster-dino',
    { ...INDOOR, L: '#f4e6b0', g: '#5a9e5a', e: '#221c1a', G: '#9bc46f' },
    POSTER_DINO,
  ),
  'drawing-table': parseSprite(
    'drawing-table',
    { ...INDOOR, W: '#f6f2ea', R: '#d0504a', Y: '#f2cf5b', B: '#4a72b8', G: '#5a9e5a' },
    DRAWING_TABLE,
  ),
  'play-mat': parseSprite(
    'play-mat',
    { G: '#3d7a45', g: '#6aa860', r: '#5a5f6e', w: '#f2efe3', b: '#5a9ad6' },
    playMat(40, 22),
  ),
  'rug-rainbow': parseSprite(
    'rug-rainbow',
    { 1: '#f2cf5b', 2: '#e8894a', 3: '#d0504a', 4: '#8a5aa8', 5: '#4a72b8' },
    rainbowRug(30, 18),
  ),
  'gaming-desk': parseSprite(
    'gaming-desk',
    {
      ...INDOOR,
      o: '#1d1f2b',
      s: '#7fc4ea',
      w: '#f2efe3',
      Y: '#f2cf5b',
      g: '#5a9e5a',
      R: '#d0504a',
      u: '#8a5a3a',
      N: '#3a3d4a',
      d: '#2f3242',
      G: '#5ad06a',
      B: '#4a8be0',
      M: '#c35bd6',
      h: '#c43c3c',
      x: '#2a2a33',
      l: '#6ad0ff',
    },
    GAMING_DESK,
  ),
  'office-chair': parseSprite(
    'office-chair',
    { ...INDOOR, x: '#5a5f6e', X: '#7a8090', m: '#5a5f6e' },
    CHAIR,
  ),
  'game-shelf': parseSprite(
    'game-shelf',
    {
      ...INDOOR,
      1: '#b84a4a',
      2: '#4a72b8',
      3: '#d9b44a',
      4: '#5a9e5a',
      5: '#e6e0d0',
      6: '#8a5aa8',
      x: '#2a2a33',
      R: '#d0504a',
      G: '#5a9e5a',
      Z: '#4a4d5c',
      s: '#7fc4ea',
    },
    GAME_SHELF,
  ),
  'coat-rack': parseSprite(
    'coat-rack',
    { ...INDOOR, G: '#4f7a5a', g: '#3d6147', R: '#c43c3c', r: '#9a2e2e' },
    COAT_RACK,
  ),
  doormat: parseSprite('doormat', { ...INDOOR, M: '#7a5a34', m: '#9a7848' }, DOORMAT),
  runner: parseSprite(
    'runner',
    { ...INDOOR, f: '#e6dcc6', r: '#5a3a5a', R: '#7a4a6e', y: '#d6a85a' },
    runner(176, 10),
  ),
  'frame-sea': parseSprite('frame-sea', FRAMES, FRAME_SEA),
  'frame-flowers': parseSprite('frame-flowers', FRAMES, FRAME_FLOWERS),
  'frame-mountain': parseSprite('frame-mountain', FRAMES, FRAME_MOUNTAIN),
};
