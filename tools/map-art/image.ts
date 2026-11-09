/** RGBA images, 8 bits per channel, row by row. */
export interface Image {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

export function createImage(width: number, height: number): Image {
  return { width, height, data: new Uint8Array(width * height * 4) };
}

/** Draws `sprite` over `target` with its top-left corner at (x, y), alpha blended. */
export function drawImage(target: Image, sprite: Image, x: number, y: number): void {
  for (let row = 0; row < sprite.height; row += 1) {
    for (let column = 0; column < sprite.width; column += 1) {
      const tx = x + column;
      const ty = y + row;
      if (tx < 0 || ty < 0 || tx >= target.width || ty >= target.height) continue;
      const from = (row * sprite.width + column) * 4;
      const to = (ty * target.width + tx) * 4;
      const alpha = (sprite.data[from + 3] ?? 0) / 255;
      if (alpha === 0) continue;
      const below = (target.data[to + 3] ?? 0) / 255;
      const out = alpha + below * (1 - alpha);
      for (let channel = 0; channel < 3; channel += 1) {
        const top = sprite.data[from + channel] ?? 0;
        const bottom = target.data[to + channel] ?? 0;
        target.data[to + channel] = Math.round((top * alpha + bottom * below * (1 - alpha)) / out);
      }
      target.data[to + 3] = Math.round(out * 255);
    }
  }
}

/** Nearest-neighbour enlargement: each pixel becomes a `factor` × `factor` square. */
export function enlarge(image: Image, factor: number): Image {
  const out = createImage(image.width * factor, image.height * factor);
  for (let y = 0; y < out.height; y += 1) {
    for (let x = 0; x < out.width; x += 1) {
      const from = (Math.floor(y / factor) * image.width + Math.floor(x / factor)) * 4;
      out.data.set(image.data.subarray(from, from + 4), (y * out.width + x) * 4);
    }
  }
  return out;
}
