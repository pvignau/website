/**
 * Just enough PNG for pixel art: decodes 8-bit greyscale, RGB, RGBA and
 * palette images (palette ones in 1, 2, 4 or 8 bits), not interlaced; encodes
 * a palette image when there are 256 colours or fewer, else RGBA.
 */
import { deflateSync, inflateSync } from 'node:zlib';
import type { Image } from './image.ts';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let crc = n;
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (CRC_TABLE[(crc ^ byte) & 255] ?? 0) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

/** Channels per pixel, by PNG colour type. */
const CHANNELS: Readonly<Record<number, number>> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(left: number, up: number, upLeft: number): number {
  const p = left + up - upLeft;
  const [pa, pb, pc] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - upLeft)];
  return pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
}

export function decodePng(file: Uint8Array): Image {
  const bytes = Buffer.from(file.buffer, file.byteOffset, file.byteLength);
  if (!bytes.subarray(0, 8).equals(SIGNATURE)) throw new Error('Not a PNG file.');
  let width = 0;
  let height = 0;
  let depth = 0;
  let colourType = 0;
  let palette: Uint8Array = new Uint8Array();
  let transparency: Uint8Array = new Uint8Array();
  const compressed: Uint8Array[] = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8] ?? 0;
      colourType = data[9] ?? 0;
      if (data[12] !== 0) throw new Error('Interlaced PNG files are not supported.');
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') transparency = data;
    else if (type === 'IDAT') compressed.push(data);
    else if (type === 'IEND') break;
    offset += 12 + length;
  }
  const channels = CHANNELS[colourType];
  if (channels === undefined || (depth !== 8 && !(colourType === 3 && depth < 8))) {
    throw new Error(`Unsupported PNG: colour type ${colourType}, ${depth} bits.`);
  }
  const raw = inflateSync(Buffer.concat(compressed));
  const stride = Math.ceil((width * channels * depth) / 8);
  const step = Math.max(1, (channels * depth) >> 3);
  const lines = new Uint8Array(stride * height);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)] ?? 0;
    const line = y * stride;
    for (let i = 0; i < stride; i += 1) {
      const left = i >= step ? (lines[line + i - step] ?? 0) : 0;
      const up = y > 0 ? (lines[line - stride + i] ?? 0) : 0;
      const upLeft = y > 0 && i >= step ? (lines[line - stride + i - step] ?? 0) : 0;
      const value = raw[y * (stride + 1) + 1 + i] ?? 0;
      const predicted = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)][filter] ?? 0;
      lines[line + i] = (value + predicted) & 255;
    }
  }
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = y * stride + x * channels;
      const out = (y * width + x) * 4;
      if (colourType === 3) {
        const bit = x * depth;
        const index =
          ((lines[y * stride + (bit >> 3)] ?? 0) >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
        data[out] = palette[index * 3] ?? 0;
        data[out + 1] = palette[index * 3 + 1] ?? 0;
        data[out + 2] = palette[index * 3 + 2] ?? 0;
        data[out + 3] = transparency[index] ?? 255;
      } else {
        const grey = channels < 3;
        data[out] = lines[at] ?? 0;
        data[out + 1] = lines[at + (grey ? 0 : 1)] ?? 0;
        data[out + 2] = lines[at + (grey ? 0 : 2)] ?? 0;
        data[out + 3] = channels === 2 || channels === 4 ? (lines[at + channels - 1] ?? 0) : 255;
      }
    }
  }
  return { width, height, data };
}

export function encodePng(image: Image): Buffer {
  const { width, height, data } = image;
  // Each pixel read as one big-endian number: 0xRRGGBBAA.
  const pixels = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const colours = new Map<number, number>();
  for (let i = 0; i < width * height && colours.size <= 256; i += 1) {
    const rgba = pixels.getUint32(i * 4);
    if (!colours.has(rgba)) colours.set(rgba, colours.size);
  }
  const indexed = colours.size <= 256;
  const stride = indexed ? width : width * 4;
  // Filter type 0 (none) on every line: the first byte of each line stays 0.
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const at = y * (stride + 1) + 1;
      if (indexed) raw[at + x] = colours.get(pixels.getUint32(i * 4)) ?? 0;
      else raw.set(data.subarray(i * 4, i * 4 + 4), at + x * 4);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = indexed ? 3 : 6;
  const parts = [SIGNATURE, chunk('IHDR', header)];
  if (indexed) {
    const entries = [...colours.keys()];
    const palette = new Uint8Array(entries.length * 3);
    const alpha = new Uint8Array(entries.length);
    entries.forEach((rgba, index) => {
      palette.set([rgba >>> 24, (rgba >>> 16) & 255, (rgba >>> 8) & 255], index * 3);
      alpha[index] = rgba & 255;
    });
    parts.push(chunk('PLTE', palette));
    if (alpha.some((value) => value < 255)) parts.push(chunk('tRNS', alpha));
  }
  parts.push(chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array()));
  return Buffer.concat(parts);
}
