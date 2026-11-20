/** Sprites of the world map: the signs and the AI lab. */
import { COLOURS, SHADOW } from '../comic.ts';
import type { Image } from '../image.ts';
import type { Palette } from '../sprite.ts';
import { parseSprite } from '../sprite.ts';

/** Outdoor colours, from the colour guide (comic.ts), like the wood of the world map. */
const OUTDOOR: Palette = {
  o: COLOURS.ink, // outlines
  b: COLOURS.wood, // wood
  w: COLOURS.wood, // wood, lit
  f: COLOURS.orange, // light wood, sign faces
  h: COLOURS.yellow, // highlight
  s: SHADOW, // shadow on the grass
  D: COLOURS.brown, // pictograms burnt in the wood
  p: COLOURS.paper, // paper
  l: COLOURS.ink, // writing
  q: COLOURS.cyan, // blue poster
  r: COLOURS.red, // red poster
};

/** By the house door: a house. */
const SIGN_HOME = `
  ................
  ..ooooooooooooo.
  ..ohhhhhhhhhhho.
  ..offfffDfffffo.
  ..offffDDDffffo.
  ..offfDDDDDfffo.
  ..offDDDDDDDffo.
  ..offfDfffDfffo.
  ..offfDfDfDfffo.
  ..offfDDDDDfffo.
  ..owwwwwwwwwwwo.
  ..ooooooooooooo.
  .......obo......
  .......obo......
  ......sobos.....
  .......sss......
`;

/** At the pier: an arrow with an anchor, towards the boat. */
const SIGN_PIER = `
  ................
  ..ooooooooooo...
  ..ohhhhhhhhhho..
  ..offfffDfffffo.
  ..offffDfDfffffo
  ..offfffDffffffo
  ..offfDDDDDffffo
  ..offfffDffffffo
  ..offDffDffDffo.
  ..offfDDDDDffo..
  ..ooooooooooo...
  .......obo......
  .......obo......
  .......obo......
  ......sobos.....
  .......sss......
`;

/** The projects: a notice board covered with posters. */
const SIGN_WORK = `
  ................
  .oooooooooooooo.
  .ohhhhhhhhhhhho.
  .ofpppffqqqqffo.
  .ofllpffqllqffo.
  .ofpppffqqqqffo.
  .offffffffffffo.
  .offrrrfffpppfo.
  .offrllfffpllfo.
  .offrrrfffpppfo.
  .owwwwwwwwwwwwo.
  .oooooooooooooo.
  ...ob......ob...
  ...ob......ob...
  ..sobs....sobs..
  ...ss......ss...
`;

/** The AI lab, in the annex of the workshop: steel and neon. */
const LAB: Palette = {
  k: COLOURS.ink, // frames
  d: COLOURS.ink, // sign plate
  c: COLOURS.cyan, // cyan neon
  m: COLOURS.magenta, // pink neon
  g: COLOURS.slate, // metal
  G: COLOURS.stone, // light metal
  r: COLOURS.maroon, // beacon, off (blinks over it: decor "beacon")
  w: COLOURS.paper, // wall
  W: COLOURS.shade, // wall, shaded
  1: COLOURS.stone, // wall base, top to bottom, like the wall of the annex
  2: COLOURS.stone,
  3: COLOURS.shade,
  4: COLOURS.slate,
  5: COLOURS.slate,
  q: COLOURS.navy, // glass
  Q: COLOURS.blue, // glass, reflection
  l: COLOURS.cyan, // light from inside
};

/** Rooftop sign: LAB IA in neon letters. */
const LAB_SIGN = `
  kkkkkkkkkkkkkkkkkkkkkkkkkk
  kddddddddddddddddddddddddk
  kdcddddcddccdddddmmmddmddk
  kdcdddcdcdcdcdddddmddmdmdk
  kdcdddcccdccddddddmddmmmdk
  kdcdddcdcdcdcdddddmddmdmdk
  kdcccdcdcdccdddddmmmdmdmdk
  kddddddddddddddddddddddddk
  kkkkkkkkkkkkkkkkkkkkkkkkkk
  ...gg................gg...
  ...gg................gg...
  ...gg................gg...
`;

/** Antenna on the roof; its red light blinks (decor "beacon"). */
const LAB_ANTENNA = `
  .r.
  .r.
  .G.
  GgG
  .G.
  G.g
  .G.
  G.g
  .G.
  G.g
  .G.
  G.g
  .G.
  G.g
  .G.
  GGg
`;

/** Glass door, lit from inside, where the round window was. */
const LAB_DOOR = `
  wwwwwwwwwwwwww
  wwwwwwwwwwwwww
  wwwwwwwwwwwwww
  wwwwwwwwwwwwww
  wwllllllllllww
  wWkkkkkkkkkkkw
  wWkqqqqkqqqqkw
  wWkqQqqkqQqqkw
  wWkqqQqkqqQqkw
  wWkqqqQkqqqQkw
  wWkqqqqkqqqqkw
  wWkqqqqkqqqqkw
  wWkqqqqkqqqqkw
  wWkqqqqkqqqqkw
  wWkqqqqkqqqqkw
  wWkqqqqkqqqqkw
  11kqqqqkqqqqk1
  22kllllkllllk2
  33kllllkllllk3
  44kllllkllllk4
  44kllllkllllk4
  44kkkkkkkkkkk4
  55kkkkkkkkkkk5
`;

export const WORLD_SPRITES: Readonly<Record<string, Image>> = {
  'sign-home': parseSprite('sign-home', OUTDOOR, SIGN_HOME),
  'sign-pier': parseSprite('sign-pier', OUTDOOR, SIGN_PIER),
  'sign-work': parseSprite('sign-work', OUTDOOR, SIGN_WORK),
  'lab-sign': parseSprite('lab-sign', LAB, LAB_SIGN),
  'lab-antenna': parseSprite('lab-antenna', LAB, LAB_ANTENNA),
  'lab-door': parseSprite('lab-door', LAB, LAB_DOOR),
};
