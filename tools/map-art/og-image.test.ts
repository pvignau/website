import { describe, expect, it } from 'vitest';
import { HERO } from '../../src/engine/hero.ts';
import { INK, PAPER } from './comic.ts';
import { createImage } from './image.ts';
import { OG_HEIGHT, OG_WIDTH, renderOgImage } from './og-image.ts';

describe('renderOgImage', () => {
  // A world all of paper where the real one lies, and a hero all of ink.
  const origin = { x: 864, y: 896 };
  const world = createImage(1152, 976);
  for (let i = 0; i < world.width * world.height; i += 1) world.data.set([...PAPER, 255], i * 4);
  const hero = createImage(HERO.sprite.width, HERO.sprite.height);
  for (let i = 0; i < hero.width * hero.height; i += 1) hero.data.set([...INK, 255], i * 4);
  const image = renderOgImage(world, origin, hero);

  it('makes an opaque image of the size of share previews', () => {
    expect([image.width, image.height]).toEqual([OG_WIDTH, OG_HEIGHT]);
    for (let i = 3; i < image.data.length; i += 4) expect(image.data[i]).toBe(255);
  });

  it('frames the page in paper, then an ink line', () => {
    const at = (x: number, y: number) => [
      ...image.data.subarray((y * OG_WIDTH + x) * 4, (y * OG_WIDTH + x) * 4 + 3),
    ];
    expect(at(0, 0)).toEqual([...PAPER]);
    expect(at(14, 300)).toEqual([...INK]);
    expect(at(OG_WIDTH - 1, OG_HEIGHT - 1)).toEqual([...PAPER]);
  });
});
