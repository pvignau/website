import type { Rect, Vec2 } from './geometry';

/** Hero tuning. Distances are in map pixels, durations in seconds. */
export const HERO = {
  /** Walking speed; the previous engine moved 12 px every 100 ms. */
  speed: 120,
  /** Sprite sheets: 4 frames of 24 × 36 px, one sheet per direction, frame 0 standing. */
  sprite: { width: 24, height: 36, frames: 4, frameDuration: 0.14 },
  /** Sprite pixel standing on the hero position (between the feet). */
  anchor: { x: 12, y: 34 },
  /** Collision box around the feet: the head may overlap walls, like in top-down RPGs. */
  hitbox: { width: 14, height: 8 },
} as const;

/** Collision box of a hero standing at `feet`. */
export function heroHitbox(feet: Vec2): Rect {
  const { width, height } = HERO.hitbox;
  return { x: feet.x - width / 2, y: feet.y - height, width, height };
}

/** Point used to measure the distance to interactive objects. */
export function interactionPoint(feet: Vec2): Vec2 {
  return { x: feet.x, y: feet.y - HERO.hitbox.height / 2 };
}
