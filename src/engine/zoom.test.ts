import { describe, expect, it } from 'vitest';
import { computeScale } from './camera';
import type { ZoomLevel } from './zoom';
import {
  createWheelZoom,
  DEFAULT_ZOOM,
  isZoomLevel,
  parseZoomLevel,
  stepZoom,
  ZOOM_LEVELS,
  zoomedScale,
} from './zoom';

describe('zoom levels', () => {
  it('go from far to close in whole and half steps, the default framing among them', () => {
    expect([...ZOOM_LEVELS].sort((a, b) => a - b)).toEqual([...ZOOM_LEVELS]);
    expect(ZOOM_LEVELS.every((level) => Number.isInteger(level * 2))).toBe(true);
    expect(ZOOM_LEVELS).toContain(DEFAULT_ZOOM);
    expect(DEFAULT_ZOOM).toBe(1);
  });

  it('are recognised, and nothing else is', () => {
    expect(isZoomLevel(1.5)).toBe(true);
    expect(isZoomLevel(3)).toBe(false);
    expect(isZoomLevel('1')).toBe(false);
  });
});

describe('parseZoomLevel', () => {
  it('reads a stored level back', () => {
    expect(parseZoomLevel('0.5')).toBe(0.5);
    expect(parseZoomLevel('2')).toBe(2);
  });

  it('reads anything else as no level', () => {
    for (const raw of ['', ' ', '3', '1.25', 'NaN', 'Infinity', 'big', '{"zoom":2}']) {
      expect(parseZoomLevel(raw), raw).toBeNull();
    }
  });
});

describe('zoomedScale', () => {
  it('keeps the default scale at the default level', () => {
    expect(zoomedScale(2, 1)).toBe(2);
    // Even one that is not a whole number of device pixels (the floor of computeScale).
    expect(zoomedScale(1, 1, 2.625)).toBe(1);
  });

  it('multiplies the scale by the level', () => {
    expect(zoomedScale(2, 0.5)).toBe(1);
    expect(zoomedScale(2, 1.5)).toBe(3);
    expect(zoomedScale(2, 2)).toBe(4);
  });

  it('always lands on whole device pixels per map pixel', () => {
    for (const [width, height, dpr] of [
      [390, 844, 3],
      [412, 915, 2.625],
      [1440, 900, 2],
      [1536, 864, 1.25],
      [1920, 1080, 1],
    ] as const) {
      const base = computeScale({ width, height }, 32, dpr);
      for (const level of ZOOM_LEVELS) {
        const devicePixels = zoomedScale(base, level, dpr) * dpr;
        expect(
          Math.abs(devicePixels - Math.round(devicePixels)),
          `${width}x${height}@${dpr} ×${level}`,
        ).toBeLessThan(1e-9);
      }
    }
  });

  it('rounds to the nearest device pixel, never under one', () => {
    // A phone at three device pixels per map pixel: half of it rounds to two.
    expect(zoomedScale(1, 0.5, 3)).toBeCloseTo(2 / 3);
    expect(zoomedScale(1, 1.5, 3)).toBeCloseTo(5 / 3);
    expect(zoomedScale(1, 0.5, 1)).toBe(1);
    expect(zoomedScale(1, 0.5, 0)).toBe(1);
  });

  it('never shrinks when zooming in, nor grows when zooming out', () => {
    // A page zoomed out by the browser has a device pixel ratio under 1.
    for (const dpr of [0.5, 1, 1.25, 2, 2.625, 3]) {
      for (const side of [200, 320, 390, 568, 720, 900, 1080, 1440, 2160]) {
        const base = computeScale({ width: side * 1.5, height: side }, 32, dpr);
        const scales = ZOOM_LEVELS.map((level) => zoomedScale(base, level, dpr));
        expect(
          scales.every((scale, index) => index === 0 || scale >= (scales[index - 1] ?? 0)),
          `${side}@${dpr}: ${scales.join(', ')}`,
        ).toBe(true);
      }
    }
  });
});

describe('stepZoom', () => {
  const scaleAt = (base: number, dpr: number) => (level: ZoomLevel) =>
    zoomedScale(base, level, dpr);

  it('moves one level in or out', () => {
    expect(stepZoom(1, 1, scaleAt(2, 1))).toBe(1.5);
    expect(stepZoom(1.5, 1, scaleAt(2, 1))).toBe(2);
    expect(stepZoom(1, -1, scaleAt(2, 1))).toBe(0.5);
  });

  it('stops at both ends', () => {
    expect(stepZoom(2, 1, scaleAt(2, 1))).toBeNull();
    expect(stepZoom(0.5, -1, scaleAt(2, 1))).toBeNull();
  });

  it('skips a level that would change nothing, and stops when none would', () => {
    // One device pixel per map pixel: zooming out has nowhere to go, 1.5 and 2 both round to 2.
    const tiny = scaleAt(1, 1);
    expect(stepZoom(1, -1, tiny)).toBeNull();
    expect(stepZoom(1, 1, tiny)).toBe(1.5);
    expect(stepZoom(1.5, 1, tiny)).toBeNull();
    expect(stepZoom(0.5, 1, tiny)).toBe(1.5);
  });
});

describe('createWheelZoom', () => {
  const wheel = (timeStamp: number, deltaY: number, ctrlKey = false) => ({
    timeStamp,
    deltaY,
    ctrlKey,
  });

  it('zooms in when the wheel goes up, out when it goes down', () => {
    expect(createWheelZoom()(wheel(1000, -100))).toBe(1);
    expect(createWheelZoom()(wheel(1000, 100))).toBe(-1);
  });

  it('takes one step per gesture, however many events it sends', () => {
    const zoom = createWheelZoom(200);
    // A touchpad swipe: an event every 16 ms, momentum included.
    const steps = Array.from({ length: 60 }, (_, index) => zoom(wheel(1000 + index * 16, -4)));
    expect(steps.filter((step) => step !== null)).toEqual([1]);
    // After a pause, the next notch is a new gesture.
    expect(zoom(wheel(1000 + 59 * 16 + 250, 100))).toBe(-1);
  });

  it('leaves a pinch (ctrlKey) and sideways scrolling to the browser', () => {
    const zoom = createWheelZoom();
    expect(zoom(wheel(1000, -100, true))).toBeNull();
    expect(zoom(wheel(2000, 0))).toBeNull();
    // Neither of them started a gesture.
    expect(zoom(wheel(2010, -100))).toBe(1);
  });
});
