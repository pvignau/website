import type { Vec2 } from './geometry';

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTIONS: readonly Direction[] = ['up', 'down', 'left', 'right'];

export function isDirection(value: unknown): value is Direction {
  return typeof value === 'string' && (DIRECTIONS as readonly string[]).includes(value);
}

/**
 * Physical keys (`KeyboardEvent.code`): W A S D on a QWERTY keyboard are
 * Z Q S D on an AZERTY one, so both layouts work without detection.
 */
const DIRECTION_BY_CODE: Readonly<Partial<Record<string, Direction>>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyA: 'left',
  KeyS: 'down',
  KeyD: 'right',
};

/** Fallback on the produced character, for keyboards that report no `code`. */
const DIRECTION_BY_KEY: Readonly<Partial<Record<string, Direction>>> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  z: 'up',
  w: 'up',
  q: 'left',
  a: 'left',
  s: 'down',
  d: 'right',
};

export function directionFromKey(event: Pick<KeyboardEvent, 'code' | 'key'>): Direction | null {
  return DIRECTION_BY_CODE[event.code] ?? DIRECTION_BY_KEY[event.key.toLowerCase()] ?? null;
}

export function isInteractKey(event: Pick<KeyboardEvent, 'code' | 'key'>): boolean {
  return event.key === ' ' || event.key === 'Enter' || event.code === 'Space';
}

export function isHelpKey(event: Pick<KeyboardEvent, 'key'>): boolean {
  return event.key === '?';
}

/** Unit-less input vector; opposite directions cancel each other. */
export function directionVector(pressed: ReadonlySet<Direction>): Vec2 {
  const x = (pressed.has('right') ? 1 : 0) - (pressed.has('left') ? 1 : 0);
  const y = (pressed.has('down') ? 1 : 0) - (pressed.has('up') ? 1 : 0);
  return { x, y };
}

/**
 * Sprite direction for an input vector. Moving diagonally keeps the current
 * facing when it matches one of the two axes, so the sprite does not flicker.
 */
export function resolveFacing(current: Direction, vector: Vec2): Direction {
  const horizontal: Direction | null = vector.x > 0 ? 'right' : vector.x < 0 ? 'left' : null;
  const vertical: Direction | null = vector.y > 0 ? 'down' : vector.y < 0 ? 'up' : null;
  if (horizontal && vertical) {
    return current === horizontal || current === vertical ? current : vertical;
  }
  return horizontal ?? vertical ?? current;
}

/** Below this share of the pad radius, the finger is in the dead zone. */
const DEAD_ZONE = 0.25;
/** cos(67.5°): an axis counts once the finger is within 67.5° of it, which gives 8 sectors. */
const AXIS_THRESHOLD = 0.38;

/** Directions pressed by a finger at (dx, dy) from the centre of a pad of radius `radius`. */
export function padDirections(dx: number, dy: number, radius: number): Set<Direction> {
  const pressed = new Set<Direction>();
  const distance = Math.hypot(dx, dy);
  if (distance < radius * DEAD_ZONE) return pressed;
  const x = dx / distance;
  const y = dy / distance;
  if (x > AXIS_THRESHOLD) pressed.add('right');
  if (x < -AXIS_THRESHOLD) pressed.add('left');
  if (y > AXIS_THRESHOLD) pressed.add('down');
  if (y < -AXIS_THRESHOLD) pressed.add('up');
  return pressed;
}
