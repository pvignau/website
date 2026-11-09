/** Sprites of the world map: the signs. */
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

export const WORLD_SPRITES: Readonly<Record<string, Image>> = {
  'sign-home': parseSprite('sign-home', OUTDOOR, SIGN_HOME),
  'sign-pier': parseSprite('sign-pier', OUTDOOR, SIGN_PIER),
  'sign-work': parseSprite('sign-work', OUTDOOR, SIGN_WORK),
};
