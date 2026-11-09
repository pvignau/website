/**
 * Every sprite, by name. Each object of the `art` layer of a Tiled map names
 * one of them and gives its place: tools/map-art/build.ts draws them over the
 * base image of the map (see the README).
 */
import type { Image } from './image.ts';
import { HOME_SPRITES } from './sprites/home.ts';
import { WORLD_SPRITES } from './sprites/world.ts';

export const SPRITES: Readonly<Record<string, Image>> = { ...WORLD_SPRITES, ...HOME_SPRITES };
