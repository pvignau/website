/** Sprites of the world map: the signs and the AI lab. */
import type { Image } from '../image.ts';
import type { Palette } from '../sprite.ts';
import { parseSprite } from '../sprite.ts';

/** Outdoor colours, taken from the world map. */
const OUTDOOR: Palette = {
  o: '#915841', // dark wood, outlines
  b: '#b56e4b', // wood
  w: '#d38658', // wood, lit
  f: '#e6a271', // light wood, sign faces
  h: '#efb171', // highlight
  s: '#4faf7b', // shadow on the grass
  D: '#a0654d', // pictograms burnt in the wood
  p: '#f1e6d6', // paper
  l: '#a79796', // writing
  q: '#5299d7', // blue poster
  r: '#d75278', // red poster
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
  k: '#3a3a50', // frames
  d: '#2b2d42', // sign plate
  c: '#a0f2e5', // cyan neon
  m: '#f07fc0', // pink neon
  g: '#8e8f8e', // metal
  G: '#d3cdc4', // light metal
  r: '#a33a3a', // beacon, off (blinks over it: decor "beacon")
  w: '#f1e6d6', // wall
  W: '#d3cdc4', // wall, shaded
  1: '#baafa7', // wall base, top to bottom
  2: '#99a49b',
  3: '#d3cdc4',
  4: '#8e8f8e',
  5: '#7a7b64',
  q: '#2d4f63', // glass
  Q: '#4f8197', // glass, reflection
  l: '#60dac7', // light from inside
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
