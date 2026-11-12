import { describe, expect, it } from 'vitest';
import { computeCamera, computeScale, snapToDevicePixel } from './camera';

describe('computeScale', () => {
  it('shows about twelve tiles across the shorter side', () => {
    expect(computeScale({ width: 1280, height: 720 }, 32)).toBe(2);
    expect(computeScale({ width: 1920, height: 1080 }, 32)).toBe(3);
    expect(computeScale({ width: 390, height: 844 }, 32, 3)).toBe(1);
  });

  it('only uses whole device pixels, so pixel art stays crisp', () => {
    const scale = computeScale({ width: 1440, height: 900 }, 32, 2);
    expect(scale).toBe(2.5);
    expect(Number.isInteger(scale * 2)).toBe(true);
    const laptop = computeScale({ width: 1536, height: 864 }, 32, 1.25);
    expect(Number.isInteger(Math.round(laptop * 1.25 * 1e9) / 1e9)).toBe(true);
  });

  it('never goes below one CSS pixel per map pixel', () => {
    expect(computeScale({ width: 200, height: 200 }, 32)).toBe(1);
    expect(computeScale({ width: 800, height: 600 }, 32, 0)).toBe(2);
  });
});

describe('snapToDevicePixel', () => {
  it('rounds to the device pixel grid', () => {
    expect(snapToDevicePixel(10.3)).toBe(10);
    expect(snapToDevicePixel(10.3, 2)).toBe(10.5);
  });
});

describe('computeCamera', () => {
  const viewport = { width: 800, height: 600 };
  const map = { width: 3840, height: 3840 };

  it('centres the focus point', () => {
    expect(computeCamera({ x: 1000, y: 1000 }, viewport, map, 2)).toEqual({ x: -1600, y: -1700 });
  });

  it('stops at the map edges', () => {
    expect(computeCamera({ x: 10, y: 10 }, viewport, map, 2)).toEqual({ x: 0, y: 0 });
    expect(computeCamera({ x: 3830, y: 3830 }, viewport, map, 2)).toEqual({
      x: -(3840 * 2 - 800),
      y: -(3840 * 2 - 600),
    });
  });

  it('centres a map smaller than the viewport', () => {
    expect(computeCamera({ x: 0, y: 0 }, viewport, { width: 480, height: 256 }, 1)).toEqual({
      x: 160,
      y: 172,
    });
  });

  it('snaps the offset to device pixels', () => {
    const { x } = computeCamera({ x: 1000.3, y: 1000 }, viewport, map, 1, 2);
    expect(Number.isInteger(x * 2)).toBe(true);
  });
});
