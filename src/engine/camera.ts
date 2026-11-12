import type { Size, Vec2 } from './geometry';
import { clamp } from './geometry';

/** Roughly how many tiles fit across the shorter side of the screen. */
export const TARGET_VISIBLE_TILES = 12;

/**
 * Display scale (CSS pixels per map pixel). It is a whole number of *device*
 * pixels, so pixel art stays crisp, chosen so that about
 * `TARGET_VISIBLE_TILES` tiles fit across the shorter side of the viewport.
 */
export function computeScale(viewport: Size, tileSize: number, devicePixelRatio = 1): number {
  const dpr = devicePixelRatio > 0 ? devicePixelRatio : 1;
  const ideal = Math.min(viewport.width, viewport.height) / (TARGET_VISIBLE_TILES * tileSize);
  const devicePixels = Math.max(1, Math.round(ideal * dpr));
  return Math.max(1, devicePixels / dpr);
}

/** Rounds a CSS length to the device pixel grid, to avoid blurry sub-pixel sprites. */
export function snapToDevicePixel(value: number, devicePixelRatio = 1): number {
  const dpr = devicePixelRatio > 0 ? devicePixelRatio : 1;
  // `|| 0` turns -0 into 0.
  return Math.round(value * dpr) / dpr || 0;
}

/**
 * Translation (in CSS pixels) to apply to the scaled map so that `focus` is
 * centred, without ever showing anything beyond the map edges. A map smaller
 * than the viewport is centred instead.
 */
export function computeCamera(
  focus: Vec2,
  viewport: Size,
  map: Size,
  scale: number,
  devicePixelRatio = 1,
): Vec2 {
  const axis = (target: number, view: number, length: number): number => {
    const world = length * scale;
    const offset =
      world <= view ? (view - world) / 2 : -clamp(target * scale - view / 2, 0, world - view);
    return snapToDevicePixel(offset, devicePixelRatio);
  };
  return {
    x: axis(focus.x, viewport.width, map.width),
    y: axis(focus.y, viewport.height, map.height),
  };
}
