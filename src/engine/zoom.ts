/**
 * Zoom levels, from farthest to closest. 1 is the default framing: about
 * twelve tiles across the shorter side of the screen (see computeScale).
 * Whole and half steps only: rounded to whole device pixels per map pixel,
 * each of them keeps the pixel art square and crisp.
 */
export const ZOOM_LEVELS = [0.5, 1, 1.5, 2] as const;

export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export const DEFAULT_ZOOM: ZoomLevel = 1;

/** 1 zooms in (closer), -1 zooms out (farther). */
export type ZoomDirection = 1 | -1;

export function isZoomLevel(value: unknown): value is ZoomLevel {
  return ZOOM_LEVELS.some((level) => level === value);
}

/** A zoom level read back from storage; anything else (old format, manual edit) reads as null. */
export function parseZoomLevel(raw: string): ZoomLevel | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return isZoomLevel(value) ? value : null;
}

/**
 * Display scale (CSS pixels per map pixel) at a zoom level: the default scale
 * times `zoom`, rounded to a whole number of device pixels per map pixel, so
 * that pixel art stays crisp. Zoomed out, it may go under one CSS pixel per
 * map pixel, never under one device pixel. The default level keeps the
 * default scale as it is.
 */
export function zoomedScale(baseScale: number, zoom: number, devicePixelRatio = 1): number {
  if (zoom === 1) return baseScale;
  const dpr = devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.max(1, Math.round(baseScale * zoom * dpr)) / dpr;
}

/**
 * The next level in `direction` that changes the scale, or null when there is
 * none. On a small screen, two levels may round to the same scale: a step
 * skips the level that would change nothing, and a button with nothing left
 * to do turns off.
 */
export function stepZoom(
  zoom: ZoomLevel,
  direction: ZoomDirection,
  scaleAt: (level: ZoomLevel) => number,
): ZoomLevel | null {
  const current = scaleAt(zoom);
  for (
    let index = ZOOM_LEVELS.indexOf(zoom) + direction;
    index >= 0 && index < ZOOM_LEVELS.length;
    index += direction
  ) {
    const level = ZOOM_LEVELS[index];
    if (level !== undefined && (scaleAt(level) - current) * direction > 0) return level;
  }
  return null;
}

/** The part of a WheelEvent the zoom reads. */
export interface WheelLike {
  readonly deltaY: number;
  readonly ctrlKey: boolean;
  /** Milliseconds, as in Event.timeStamp. */
  readonly timeStamp: number;
}

/** Quiet time that ends a wheel gesture. */
export const WHEEL_GESTURE_GAP_MS = 200;

/**
 * Turns wheel events into zoom steps, one per gesture: a notch of a mouse
 * wheel, or a swipe on a touchpad, which sends a stream of events, momentum
 * included. A gesture ends after `gapMs` without events. Wheel up zooms in.
 * A touchpad pinch comes as wheel events with `ctrlKey`: it is left to the
 * browser, which zooms the page, as Ctrl and the wheel do.
 */
export function createWheelZoom(
  gapMs = WHEEL_GESTURE_GAP_MS,
): (event: WheelLike) => ZoomDirection | null {
  let last = -Infinity;
  return (event) => {
    if (event.ctrlKey || event.deltaY === 0) return null;
    const startsGesture = event.timeStamp - last > gapMs;
    last = event.timeStamp;
    if (!startsGesture) return null;
    return event.deltaY < 0 ? 1 : -1;
  };
}
