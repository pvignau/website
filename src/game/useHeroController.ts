import type { RefObject } from 'react';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { PlaceId } from '../content';
import { computeCamera, snapToDevicePixel } from '../engine/camera';
import { moveAndSlide, rectHitsSolid } from '../engine/collision';
import type { Size, Vec2 } from '../engine/geometry';
import { HERO, heroHitbox, interactionPoint } from '../engine/hero';
import type { Direction } from '../engine/input';
import { directionVector, resolveFacing } from '../engine/input';
import type { MinimapLayout } from '../engine/minimap';
import { projectToMinimap } from '../engine/minimap';
import { findNearest } from '../engine/proximity';
import type { GameMap, Interactable, SpawnPoint } from '../engine/tiled';
import { useAnimationFrame } from './useAnimationFrame';

export interface HeroElements {
  world: RefObject<HTMLDivElement | null>;
  hero: RefObject<HTMLDivElement | null>;
  /** The hero on the minimap, if the map has one. */
  minimapHero: RefObject<HTMLElement | null>;
  /** Debug overlay only. */
  hitbox: RefObject<SVGRectElement | null>;
  coordinates: RefObject<HTMLOutputElement | null>;
}

interface HeroControllerOptions {
  map: GameMap<PlaceId>;
  spawn: SpawnPoint;
  /** False while loading or while a dialog is open: the loop stops. */
  active: boolean;
  viewport: Size;
  scale: number;
  /** Where the hero shows on the minimap; null on a map without one. */
  minimap: MinimapLayout<PlaceId> | null;
  elements: HeroElements;
  /** Directions currently held (keyboard and touch pad). */
  readDirections: () => ReadonlySet<Direction>;
  onNearestChange: (item: Interactable<PlaceId> | null) => void;
}

interface HeroState {
  position: Vec2;
  facing: Direction;
  /** Seconds spent walking since the last stop, drives the walk cycle. */
  walkTime: number;
  frame: number;
  nearest: Interactable<PlaceId> | null;
  /** Last values written to the DOM, to skip identical writes. */
  written: { hero: string; world: string; facing: string; frame: string; minimap: string };
}

/** Writes the hero, the camera, the hero on the minimap and the debug overlay to the DOM, and reports the nearby object. */
function renderFrame(hero: HeroState, options: HeroControllerOptions): void {
  const { map, viewport, scale, minimap, elements, onNearestChange } = options;
  const dpr = window.devicePixelRatio || 1;
  const { written } = hero;

  const heroElement = elements.hero.current;
  if (heroElement) {
    const x = snapToDevicePixel((hero.position.x - HERO.anchor.x) * scale, dpr);
    const y = snapToDevicePixel((hero.position.y - HERO.anchor.y) * scale, dpr);
    const transform = `translate3d(${x}px, ${y}px, 0)`;
    if (transform !== written.hero) heroElement.style.transform = written.hero = transform;
    if (hero.facing !== written.facing) heroElement.dataset.facing = written.facing = hero.facing;
    const frame = String(hero.frame);
    if (frame !== written.frame) heroElement.style.setProperty('--frame', (written.frame = frame));
  }

  const worldElement = elements.world.current;
  if (worldElement) {
    const focus = { x: hero.position.x, y: hero.position.y - HERO.sprite.height / 2 };
    const camera = computeCamera(focus, viewport, map, scale, dpr);
    const transform = `translate3d(${camera.x}px, ${camera.y}px, 0)`;
    if (transform !== written.world) worldElement.style.transform = written.world = transform;
  }

  // The minimap moves pixel by pixel of its own: a write every 16 map pixels or so, not every frame.
  const marker = elements.minimapHero.current;
  if (marker && minimap) {
    const { x, y } = projectToMinimap(hero.position, minimap);
    const transform = `translate(${((x + 0.5) / minimap.width) * 100}%, ${((y + 0.5) / minimap.height) * 100}%)`;
    if (transform !== written.minimap) marker.style.transform = written.minimap = transform;
  }

  const hitbox = elements.hitbox.current;
  if (hitbox) {
    const box = heroHitbox(hero.position);
    hitbox.setAttribute('x', String(box.x));
    hitbox.setAttribute('y', String(box.y));
  }
  const coordinates = elements.coordinates.current;
  if (coordinates) {
    const { x, y } = hero.position;
    const tile = map.tileSize;
    coordinates.value = `${x.toFixed(0)}, ${y.toFixed(0)} · ${Math.floor(x / tile)}, ${Math.floor(y / tile)}`;
  }

  const nearest = findNearest(map.interactables, interactionPoint(hero.position));
  if (nearest?.id !== hero.nearest?.id) {
    hero.nearest = nearest;
    onNearestChange(nearest);
  }
}

/**
 * Moves the hero with a delta-time loop. Collisions are resolved per axis
 * against the tile grid; the camera follows within the map bounds. The DOM
 * is written directly (transforms, data attributes): React only re-renders
 * when the nearby object changes.
 */
export interface HeroController {
  /** Moves the hero instantly (debug mode); ignored if its hitbox would hit a wall. */
  teleport: (feet: Vec2) => void;
}

export function useHeroController(options: HeroControllerOptions): HeroController {
  const { spawn, active, viewport, scale } = options;
  const state = useRef<HeroState>({
    position: spawn.position,
    facing: spawn.facing,
    walkTime: 0,
    frame: 0,
    nearest: null,
    written: { hero: '', world: '', facing: '', frame: '', minimap: '' },
  });
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });

  // First paint, and again whenever the viewport or the scale changes.
  useLayoutEffect(() => {
    renderFrame(state.current, latest.current);
  }, [viewport, scale]);

  // Paused (dialog open): stand still instead of freezing mid-stride.
  useLayoutEffect(() => {
    if (active) return;
    state.current.walkTime = 0;
    state.current.frame = 0;
    renderFrame(state.current, latest.current);
  }, [active]);

  const controller = useMemo<HeroController>(
    () => ({
      teleport: (feet) => {
        if (rectHitsSolid(latest.current.map.collisions, heroHitbox(feet))) return;
        state.current.position = feet;
        renderFrame(state.current, latest.current);
      },
    }),
    [],
  );

  useAnimationFrame((delta) => {
    const hero = state.current;
    const { map, readDirections } = latest.current;
    const input = directionVector(readDirections());
    if (input.x === 0 && input.y === 0) {
      hero.walkTime = 0;
      hero.frame = 0;
    } else {
      const distance = HERO.speed * delta;
      const length = Math.hypot(input.x, input.y);
      const move = moveAndSlide(
        map.collisions,
        heroHitbox(hero.position),
        (input.x / length) * distance,
        (input.y / length) * distance,
      );
      hero.position = { x: hero.position.x + move.x, y: hero.position.y + move.y };
      hero.facing = resolveFacing(hero.facing, input);
      // Walking into a wall still animates the legs, like most top-down RPGs.
      hero.walkTime += delta;
      hero.frame = Math.floor(hero.walkTime / HERO.sprite.frameDuration) % HERO.sprite.frames;
    }
    renderFrame(hero, latest.current);
  }, active);

  return controller;
}
