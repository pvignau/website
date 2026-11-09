import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import type { Image } from './image.ts';
import { createImage } from './image.ts';
import { decodePng, encodePng } from './png.ts';

function image(width: number, height: number, pixel: (x: number, y: number) => number[]): Image {
  const out = createImage(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) out.data.set(pixel(x, y), (y * width + x) * 4);
  }
  return out;
}

/** A PNG written by hand: the given header fields, chunks and filtered lines. */
function png(header: number[], lines: number[][], extra: [string, number[]][] = []): Buffer {
  const chunk = (type: string, data: number[] | Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    // The decoder does not check CRCs: zeros will do.
    return Buffer.concat([length, Buffer.from(type, 'ascii'), Buffer.from(data), Buffer.alloc(4)]);
  };
  const [width = 0, height = 0, ...rest] = header;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set(rest, 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    ...extra.map(([type, data]) => chunk(type, data)),
    chunk('IDAT', deflateSync(Buffer.from(lines.flat()))),
    chunk('IEND', []),
  ]);
}

describe('PNG', () => {
  it('writes a palette image, transparency included, and reads it back', () => {
    const art = image(5, 3, (x, y) => (x === y ? [0, 0, 0, 0] : [x * 40, y * 80, 200, 255]));
    const file = encodePng(art);
    expect(file[25]).toBe(3); // colour type: palette
    expect(decodePng(file)).toEqual(art);
  });

  it('writes RGBA when there are more than 256 colours', () => {
    const art = image(20, 20, (x, y) => [x * 12, y * 12, (x + y) * 6, 255]);
    const file = encodePng(art);
    expect(file[25]).toBe(6); // colour type: RGBA
    expect(decodePng(file)).toEqual(art);
  });

  it('reads RGB lines saved with every filter, as image editors write them', () => {
    // Two pixels a line, red then blue; each line uses another filter.
    const raw = [255, 0, 0, 0, 0, 255];
    const lines = [
      [0, ...raw], // none
      [1, 255, 0, 0, 1, 0, 255], // sub: minus the pixel on the left
      [2, 0, 0, 0, 0, 0, 0], // up: same as the line above
      [3, 128, 0, 0, 129, 0, 128], // average of left and up
      [4, 0, 0, 0, 0, 0, 0], // Paeth
    ];
    const decoded = decodePng(png([2, 5, 8, 2, 0, 0, 0], lines));
    const red = [255, 0, 0, 255];
    const blue = [0, 0, 255, 255];
    expect([...decoded.data]).toEqual(Array.from({ length: 5 }, () => [...red, ...blue]).flat());
  });

  it('reads 4-bit palette images', () => {
    const palette = [10, 20, 30, 40, 50, 60];
    const decoded = decodePng(png([3, 1, 4, 3, 0, 0, 0], [[0, 0x01, 0x00]], [['PLTE', palette]]));
    expect([...decoded.data]).toEqual([10, 20, 30, 255, 40, 50, 60, 255, 10, 20, 30, 255]);
  });

  it('refuses what it cannot read', () => {
    expect(() => decodePng(Buffer.from('not a png'))).toThrow(/Not a PNG/);
    expect(() => decodePng(png([1, 1, 8, 2, 0, 0, 1], [[0, 0, 0, 0]]))).toThrow(/Interlaced/);
    expect(() => decodePng(png([1, 1, 16, 2, 0, 0, 0], [[0, 0, 0, 0, 0, 0, 0]]))).toThrow(
      /Unsupported/,
    );
  });
});
