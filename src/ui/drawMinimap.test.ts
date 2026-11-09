import { describe, expect, it, vi } from 'vitest';
import type { Rect } from '../engine/geometry';
import type { Bitmap, DrawingTools } from './drawMinimap';
import { drawMinimap } from './drawMinimap';

const FRAME: Rect = { x: 384, y: 384, width: 1536, height: 1216 };

/**
 * Stand-ins that log what they draw, as "from x,y wxh -> to wxh". `resizes`:
 * whether the bitmap comes out at the size asked, as createImageBitmap does
 * where it supports resizing.
 */
function fakes({ resizes = true, drawable = true, fails = false } = {}) {
  const log: string[] = [];
  const smoothing: boolean[] = [];
  const names = new Map<unknown, string>();
  const canvas = (name: string, width = 0, height = 0) => {
    const fake = {
      width,
      height,
      getContext: () =>
        drawable
          ? {
              set imageSmoothingEnabled(value: boolean) {
                smoothing.push(value);
              },
              clearRect: () => undefined,
              drawImage: (from: unknown, ...[x, y, w, h, , , dw, dh]: number[]) => {
                log.push(`${names.get(from) ?? '?'} ${x},${y} ${w}x${h} -> ${name} ${dw}x${dh}`);
              },
            }
          : null,
    };
    names.set(fake, name);
    return fake as unknown as HTMLCanvasElement;
  };
  const scratch = [canvas('a'), canvas('b')];
  const close = vi.fn();
  const tools: DrawingTools = {
    shrink: (_image, source, width, height) => {
      if (fails) return Promise.reject(new Error('InvalidStateError'));
      const bitmap = resizes
        ? { width, height, close }
        : { width: source.width, height: source.height, close };
      names.set(bitmap, 'bitmap');
      log.push(
        `shrink ${source.x},${source.y} ${source.width}x${source.height} -> bitmap ${bitmap.width}x${bitmap.height}`,
      );
      return Promise.resolve(bitmap as unknown as Bitmap);
    },
    createCanvas: () => scratch.shift() ?? canvas('extra'),
  };
  return { log, smoothing, close, canvas, tools, scratch: [...scratch] };
}

const image = {} as HTMLImageElement;

describe('drawMinimap', () => {
  it('crops and halves the picture, then halves it until each pixel is the mean of a block', async () => {
    const { log, smoothing, close, canvas, tools, scratch } = fakes();
    const drawn = await drawMinimap(canvas('target', 96, 76), image, FRAME, 16, tools);
    expect(drawn).toBe(true);
    expect(log).toEqual([
      'shrink 384,384 1536x1216 -> bitmap 768x608',
      'bitmap 0,0 768x608 -> b 384x304',
      'b 0,0 384x304 -> a 192x152',
      'a 0,0 192x152 -> target 96x76',
    ]);
    expect(smoothing.every(Boolean)).toBe(true);
    // The bitmap and the scratch canvases give their memory back.
    expect(close).toHaveBeenCalledOnce();
    expect(scratch.map(({ width, height }) => [width, height])).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  it('takes one more step where createImageBitmap does not resize', async () => {
    const { log, canvas, tools } = fakes({ resizes: false });
    await drawMinimap(canvas('target', 96, 76), image, FRAME, 16, tools);
    expect(log).toEqual([
      'shrink 384,384 1536x1216 -> bitmap 1536x1216',
      'bitmap 0,0 1536x1216 -> b 768x608',
      'b 0,0 768x608 -> a 384x304',
      // The scratch canvas b is larger than this step: only its top-left part is read next.
      'a 0,0 384x304 -> b 192x152',
      'b 0,0 192x152 -> target 96x76',
    ]);
  });

  it('copies the picture as it is with blocks of one pixel', async () => {
    const { log, canvas, tools } = fakes();
    await drawMinimap(
      canvas('target', 40, 30),
      image,
      { x: 5, y: 6, width: 40, height: 30 },
      1,
      tools,
    );
    expect(log).toEqual(['shrink 5,6 40x30 -> bitmap 40x30', 'bitmap 0,0 40x30 -> target 40x30']);
  });

  it('gives up where the picture cannot be read or drawn', async () => {
    const unreadable = fakes({ fails: true });
    expect(
      await drawMinimap(unreadable.canvas('target', 96, 76), image, FRAME, 16, unreadable.tools),
    ).toBe(false);

    const undrawable = fakes({ drawable: false });
    expect(
      await drawMinimap(undrawable.canvas('target', 96, 76), image, FRAME, 16, undrawable.tools),
    ).toBe(false);
    // Nothing is held either way.
    expect(undrawable.close).toHaveBeenCalledOnce();
  });
});
