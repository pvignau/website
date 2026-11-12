import { describe, expect, it } from 'vitest';
import css from './global.css?raw';

/** Custom properties of :root, with var() references resolved. */
function rootColours(): Map<string, string> {
  const root = /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
  const raw = new Map(
    [...root.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name = '', value = '']) => [
      name,
      value.trim(),
    ]),
  );
  const resolve = (value: string): string =>
    value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => resolve(raw.get(name) ?? ''));
  return new Map([...raw].map(([name, value]) => [name, resolve(value)]));
}

const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/**
 * What a focused control can sit on: the most common colours of the exported
 * maps (src/maps/*.webp), and the interface surfaces.
 */
const BACKGROUNDS: Record<string, string> = {
  sea: '#67e6d2',
  'shallow water': '#90eddf',
  grass: '#74c857',
  sand: '#f8c984',
  'house floor': '#796755',
  'house wall': '#485d84',
  'house rug': '#5b3138',
  'house shadow': '#221c1a',
  'house window': '#9097b1',
};

describe('focus ring', () => {
  const colours = rootColours();
  const ring = colours.get('--focus-ring') ?? '';
  const edge = colours.get('--focus-edge') ?? '';
  const surfaces = ['--panel-solid', '--panel-raised', '--wood', '--wood-dark', '--accent'];

  it('uses two colours that stand apart from each other', () => {
    expect(ring).toMatch(/^#[0-9a-f]{6}$/i);
    expect(edge).toMatch(/^#[0-9a-f]{6}$/i);
    expect(contrast(ring, edge)).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ...Object.entries(BACKGROUNDS),
    ...surfaces.map((name) => [name, colours.get(name) ?? ''] as const),
  ])('contrasts at least 3:1 with %s', (_, background) => {
    expect(background).toMatch(/^#[0-9a-f]{6}$/i);
    const best = Math.max(contrast(ring, background), contrast(edge, background));
    expect(best).toBeGreaterThanOrEqual(3);
  });
});
