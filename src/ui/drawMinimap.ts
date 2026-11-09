import type { Rect } from '../engine/geometry';

/** A picture to draw from, which knows its size: an ImageBitmap, or a canvas. */
type Picture = CanvasImageSource & { readonly width: number; readonly height: number };

/** An ImageBitmap, or a stand-in in the tests. */
export type Bitmap = Picture & { close: () => void };

export interface DrawingTools {
  /** Crops `source` out of the decoded image and resizes it, with a bilinear filter. */
  shrink: (
    image: ImageBitmapSource,
    source: Rect,
    width: number,
    height: number,
  ) => Promise<Bitmap>;
  createCanvas: () => HTMLCanvasElement;
}

const browserTools: DrawingTools = {
  shrink: (image, source, width, height) =>
    createImageBitmap(image, source.x, source.y, source.width, source.height, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'low',
    }),
  createCanvas: () => document.createElement('canvas'),
};

/**
 * Draws `source`, a part of the decoded `image` in its own pixels, into
 * `target`, `blockSize` times smaller: each pixel of the minimap is the mean
 * colour of a block of the map. The picture is halved again and again
 * (blockSize is a power of two): halving with a bilinear filter averages each
 * square of four pixels, in every browser, where one big step would skip
 * most of them.
 *
 * The first halving crops and shrinks the image in createImageBitmap, off the
 * main thread in Chromium: drawing the whole image into a canvas made it keep
 * a second decoded copy of it, some 20 MB for the world. The next ones go
 * through two scratch canvases, emptied at the end to give their memory back
 * at once. A browser that ignores the resizing of createImageBitmap only
 * takes one more step. Resolves to false where the picture cannot be drawn.
 */
export async function drawMinimap(
  target: HTMLCanvasElement,
  image: ImageBitmapSource,
  source: Rect,
  blockSize: number,
  { shrink, createCanvas }: DrawingTools = browserTools,
): Promise<boolean> {
  const halve = blockSize > 1 ? 2 : 1;
  let first: Bitmap;
  try {
    first = await shrink(image, source, source.width / halve, source.height / halve);
  } catch {
    // No createImageBitmap, or an image it cannot read.
    return false;
  }
  const scratch = [createCanvas(), createCanvas()];
  try {
    const rounds = Math.max(1, Math.round(Math.log2(first.width / target.width)));
    let from: Picture = first;
    // A scratch canvas may be larger than the step it holds: its top-left part.
    let [fromWidth, fromHeight] = [first.width, first.height];
    for (let round = 1; round <= rounds; round += 1) {
      const last = round === rounds;
      const width = last ? target.width : Math.round(fromWidth / 2);
      const height = last ? target.height : Math.round(fromHeight / 2);
      const canvas = last ? target : (scratch[round % 2] ?? target);
      if (canvas !== target && (canvas.width < width || canvas.height < height)) {
        canvas.width = width;
        canvas.height = height;
      }
      const context = canvas.getContext('2d');
      if (!context) return false;
      context.imageSmoothingEnabled = true;
      context.clearRect(0, 0, width, height);
      context.drawImage(from, 0, 0, fromWidth, fromHeight, 0, 0, width, height);
      from = canvas;
      [fromWidth, fromHeight] = [width, height];
    }
    return true;
  } finally {
    first.close();
    for (const canvas of scratch) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}
