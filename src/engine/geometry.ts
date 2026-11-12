/** Map coordinates are expressed in map pixels (1 Tiled pixel = 1 unit). */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

/** Axis-aligned rectangle, half-open: it covers [x, x + width) × [y, y + height). */
export interface Rect extends Vec2, Size {}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function translateRect(rect: Rect, dx: number, dy: number): Rect {
  return { ...rect, x: rect.x + dx, y: rect.y + dy };
}

/** Euclidean distance from a point to the closest point of a rectangle (0 when inside). */
export function distanceToRect(point: Vec2, rect: Rect): number {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}
