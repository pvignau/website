import { describe, expect, it } from 'vitest';
import { stripVisualData } from './tiled-map.ts';

describe('stripVisualData', () => {
  const map = {
    width: 2,
    height: 1,
    tilesets: [{ firstgid: 1, source: 'tiles.tsx' }],
    layers: [
      { type: 'tilelayer', name: 'ground', offsety: -16, data: [1, 2] },
      {
        type: 'group',
        name: 'decor',
        layers: [{ type: 'tilelayer', name: 'trees', data: [3, 0] }],
      },
      { type: 'objectgroup', name: 'art', objects: [{ id: 2, name: 'sign' }] },
      {
        type: 'group',
        name: 'meta',
        layers: [
          { type: 'tilelayer', name: 'collisions', data: [0, 9] },
          { type: 'objectgroup', name: 'objects', objects: [{ id: 1 }] },
        ],
      },
    ],
  };

  it('drops tilesets, the tile data of visual layers and the art objects, keeping offsets', () => {
    expect(stripVisualData(map)).toEqual({
      width: 2,
      height: 1,
      layers: [
        { type: 'tilelayer', name: 'ground', offsety: -16 },
        { type: 'group', name: 'decor', layers: [{ type: 'tilelayer', name: 'trees' }] },
        { type: 'objectgroup', name: 'art' },
        map.layers[3],
      ],
    });
  });

  it('leaves anything that is not a map untouched', () => {
    expect(stripVisualData('nope')).toBe('nope');
    expect(stripVisualData({ layers: 'nope' })).toEqual({ layers: 'nope' });
  });
});
