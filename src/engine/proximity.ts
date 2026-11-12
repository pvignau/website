import type { Rect, Vec2 } from './geometry';
import { distanceToRect } from './geometry';

export interface Reachable {
  /** Interaction zone, in map pixels. */
  readonly rect: Rect;
  /** How far from the zone (in map pixels) the hero can still interact with it. */
  readonly radius: number;
}

/**
 * Returns the item the hero can interact with from `point`: the closest one
 * whose zone is within its own radius, or `null`. Ties keep the first item.
 */
export function findNearest<T extends Reachable>(items: readonly T[], point: Vec2): T | null {
  let nearest: T | null = null;
  let nearestDistance = Infinity;
  for (const item of items) {
    const distance = distanceToRect(point, item.rect);
    if (distance <= item.radius && distance < nearestDistance) {
      nearest = item;
      nearestDistance = distance;
    }
  }
  return nearest;
}
