import { describe, expect, it } from 'vitest';
import { isSolidTile } from './collision';
import { DEFAULT_INTERACTION_RADIUS, findSpawn, parseTiledMap } from './tiled';

const PLACE_IDS = ['home', 'work', 'lab', 'contact'] as const;
const options = { placeIds: PLACE_IDS, noteIds: ['tv'] };

const property = (name: string, value: string | number) => ({
  name,
  type: typeof value === 'number' ? 'int' : 'string',
  value,
});

interface ObjectSpec {
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  point?: boolean;
  /** Tiled class (called "type" in the JSON format). */
  type?: string;
  props: Record<string, string | number>;
}

function object(id: number, spec: ObjectSpec) {
  const { props, ...rest } = spec;
  return {
    id,
    width: 0,
    height: 0,
    rotation: 0,
    visible: true,
    type: '',
    ...rest,
    properties: Object.entries(props).map(([name, value]) => property(name, value)),
  };
}

const SPAWN: ObjectSpec = { name: 'spawn', x: 48, y: 60, point: true, props: { action: 'spawn' } };
const WORK: ObjectSpec = {
  name: 'work',
  x: 64,
  y: 0,
  width: 32,
  height: 32,
  props: { action: 'place' },
};
const DEFAULT_OBJECTS = [SPAWN, WORK];

/** A 4 × 3 map: solid tiles in the top-left and bottom-right corners. */
function tiledMap({
  objects = DEFAULT_OBJECTS,
  metaLayers,
  ...overrides
}: { objects?: ObjectSpec[]; metaLayers?: unknown[] } & Record<string, unknown> = {}) {
  return {
    orientation: 'orthogonal',
    infinite: false,
    width: 4,
    height: 3,
    tilewidth: 32,
    tileheight: 32,
    layers: [
      { type: 'tilelayer', name: 'ground', width: 4, height: 3, data: Array<number>(12).fill(7) },
      {
        type: 'group',
        name: 'meta',
        layers: metaLayers ?? [
          {
            type: 'tilelayer',
            name: 'collisions',
            width: 4,
            height: 3,
            data: [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
            properties: [property('action', 'collision')],
          },
          {
            type: 'objectgroup',
            name: 'objects',
            objects: objects.map((spec, index) => object(index + 1, spec)),
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe('parseTiledMap', () => {
  it('reads the map size and its collision layer', () => {
    const map = parseTiledMap(tiledMap(), options);
    expect(map).toMatchObject({ width: 128, height: 96, tileSize: 32 });
    expect(isSolidTile(map.collisions, 0, 0)).toBe(true);
    expect(isSolidTile(map.collisions, 3, 2)).toBe(true);
    expect(isSolidTile(map.collisions, 1, 1)).toBe(false);
  });

  it('places a place object, named after its place id', () => {
    const map = parseTiledMap(tiledMap(), options);
    expect(map.interactables).toEqual([
      {
        kind: 'place',
        id: '2',
        name: 'work',
        placeId: 'work',
        rect: { x: 64, y: 0, width: 32, height: 32 },
        radius: DEFAULT_INTERACTION_RADIUS,
      },
    ]);
  });

  it('reads redirects, their route and the place they belong to', () => {
    const map = parseTiledMap(
      tiledMap({
        objects: [
          ...DEFAULT_OBJECTS,
          {
            name: 'home',
            x: 0,
            y: 32,
            width: 64,
            height: 32,
            props: { action: 'redirect', value: '/home' },
          },
          {
            name: 'exit',
            x: 0,
            y: 64,
            width: 32,
            height: 32,
            props: { action: 'redirect', value: '/', radius: 40 },
          },
        ],
      }),
      options,
    );
    expect(map.interactables.filter((item) => item.kind === 'warp')).toEqual([
      expect.objectContaining({
        name: 'home',
        to: '/home',
        placeId: 'home',
        radius: DEFAULT_INTERACTION_RADIUS,
      }),
      expect.objectContaining({ name: 'exit', to: '/', placeId: null, radius: 40 }),
    ]);
  });

  it('accepts the Tiled class instead of an action property', () => {
    const data = tiledMap({ objects: [SPAWN, { ...WORK, type: 'place', props: {} }] });
    expect(parseTiledMap(data, options).interactables[0]).toMatchObject({ placeId: 'work' });
  });

  it('reads spawn points: the default one and the ones serving an arrival route', () => {
    const map = parseTiledMap(
      tiledMap({
        objects: [
          ...DEFAULT_OBJECTS,
          {
            name: 'from-home',
            x: 80,
            y: 70,
            point: true,
            props: { action: 'spawn', value: '/home', direction: 'up' },
          },
        ],
      }),
      options,
    );
    expect(map.spawns).toEqual([
      { name: 'spawn', entry: null, position: { x: 48, y: 60 }, facing: 'down' },
      { name: 'from-home', entry: '/home', position: { x: 80, y: 70 }, facing: 'up' },
    ]);
    expect(findSpawn(map, '/home').name).toBe('from-home');
    expect(findSpawn(map, '/somewhere-else').name).toBe('spawn');
    expect(findSpawn(map, null).name).toBe('spawn');
  });

  it('reads notes, named after their note id', () => {
    const tv = { name: 'tv', x: 0, y: 32, width: 32, height: 16, props: { action: 'note' } };
    const map = parseTiledMap(tiledMap({ objects: [...DEFAULT_OBJECTS, tv] }), options);
    expect(map.interactables.filter((item) => item.kind === 'note')).toEqual([
      {
        kind: 'note',
        id: '3',
        name: 'tv',
        noteId: 'tv',
        rect: { x: 0, y: 32, width: 32, height: 16 },
        radius: DEFAULT_INTERACTION_RADIUS,
      },
    ]);
  });

  it('reads decorations', () => {
    const map = parseTiledMap(
      tiledMap({
        objects: [
          ...DEFAULT_OBJECTS,
          {
            name: 'leds',
            x: 10,
            y: 12,
            width: 13,
            height: 13,
            props: { action: 'decor', value: 'leds' },
          },
        ],
      }),
      options,
    );
    expect(map.decorations).toEqual([
      { id: '3', kind: 'leds', rect: { x: 10, y: 12, width: 13, height: 13 } },
    ]);
  });

  it('places the background image like Tiled exports it, offsets included', () => {
    const data = tiledMap();
    (data.layers as unknown[]).unshift(
      {
        type: 'tilelayer',
        name: 'bridge',
        width: 4,
        height: 3,
        data: [],
        offsetx: -0.3,
        offsety: -16.28,
      },
      {
        type: 'group',
        name: 'boats',
        offsety: 5,
        layers: [{ type: 'tilelayer', name: 'boat', width: 4, height: 3, data: [], offsety: 8 }],
      },
    );
    expect(parseTiledMap(data, options).background).toEqual({
      x: -1,
      y: -17,
      width: 129,
      height: 126,
    });
  });

  it('without offsets, the background covers the map exactly', () => {
    expect(parseTiledMap(tiledMap(), options).background).toEqual({
      x: 0,
      y: 0,
      width: 128,
      height: 96,
    });
  });

  /** crop-* map properties, in pixels of the exported image. */
  const crop = (x: number, y: number, width: number, height: number) => [
    property('crop-x', x),
    property('crop-y', y),
    property('crop-width', width),
    property('crop-height', height),
  ];

  it('keeps only the cropped part of the exported image, in map pixels', () => {
    const data = { ...tiledMap(), properties: crop(32, 16, 64, 48) };
    expect(parseTiledMap(data, options).background).toEqual({
      x: 32,
      y: 16,
      width: 64,
      height: 48,
    });
    // The crop counts from the exported image, whose origin follows the layer offsets.
    (data.layers as unknown[]).unshift({
      type: 'tilelayer',
      name: 'bridge',
      width: 4,
      height: 3,
      data: [],
      offsetx: -1,
      offsety: -17,
    });
    expect(parseTiledMap(data, options).background).toEqual({
      x: 31,
      y: -1,
      width: 64,
      height: 48,
    });
  });

  describe('rejects invalid data with a helpful message', () => {
    const invalid: [string, unknown, RegExp][] = [
      ['a non-object', 'nope', /\(map\): expected an object/],
      ['an isometric map', tiledMap({ orientation: 'isometric' }), /orthogonal/],
      ['an infinite map', tiledMap({ infinite: true }), /infinite/],
      ['rectangular tiles', tiledMap({ tileheight: 16 }), /square/],
      ['a map without meta group', { ...tiledMap(), layers: [] }, /missing the "meta" group/],
      [
        'an unknown place',
        tiledMap({
          objects: [
            ...DEFAULT_OBJECTS,
            { name: 'shop', x: 0, y: 0, width: 8, height: 8, props: { action: 'place' } },
          ],
        }),
        /"shop" is not a known place id/,
      ],
      [
        'an unknown action',
        tiledMap({
          objects: [...DEFAULT_OBJECTS, { name: 'x', x: 0, y: 0, props: { action: 'teleport' } }],
        }),
        /unknown action "teleport"/,
      ],
      [
        'a redirect without route',
        tiledMap({
          objects: [
            ...DEFAULT_OBJECTS,
            { name: 'door', x: 0, y: 0, width: 8, height: 8, props: { action: 'redirect' } },
          ],
        }),
        /needs a "value" route/,
      ],
      [
        'a relative route',
        tiledMap({
          objects: [
            ...DEFAULT_OBJECTS,
            {
              name: 'door',
              x: 0,
              y: 0,
              width: 8,
              height: 8,
              props: { action: 'redirect', value: '#/home' },
            },
          ],
        }),
        /must start with "\/"/,
      ],
      [
        'a point used as a place',
        tiledMap({
          objects: [
            ...DEFAULT_OBJECTS,
            { name: 'lab', x: 0, y: 0, point: true, props: { action: 'place' } },
          ],
        }),
        /needs a rectangle/,
      ],
      [
        'a wrong spawn direction',
        tiledMap({
          objects: [
            {
              name: 'spawn',
              x: 0,
              y: 0,
              point: true,
              props: { action: 'spawn', direction: 'north' },
            },
          ],
        }),
        /expected up, down, left or right/,
      ],
      [
        'a note with an unknown name',
        tiledMap({
          objects: [
            ...DEFAULT_OBJECTS,
            { name: 'radio', x: 0, y: 32, width: 8, height: 8, props: { action: 'note' } },
          ],
        }),
        /note object "radio" is not a known note id/,
      ],
      [
        'a note on a point',
        tiledMap({
          objects: [...DEFAULT_OBJECTS, { name: 'tv', x: 0, y: 32, props: { action: 'note' } }],
        }),
        /a note needs a rectangle, not a point/,
      ],
      [
        'a map without default spawn',
        tiledMap({ objects: [WORK] }),
        /exactly one default spawn, found 0/,
      ],
      [
        'two default spawns',
        tiledMap({ objects: [SPAWN, WORK, SPAWN] }),
        /exactly one default spawn, found 2/,
      ],
      [
        'a legacy redirect tile layer',
        tiledMap({
          metaLayers: [
            {
              type: 'tilelayer',
              name: 'path-home',
              width: 4,
              height: 3,
              data: [],
              properties: [property('action', 'redirect')],
            },
          ],
        }),
        /only "collision" tile layers are supported/,
      ],
      [
        'a map without collisions',
        tiledMap({ metaLayers: [] }),
        /missing a "collision" tile layer/,
      ],
      [
        'a partial crop',
        { ...tiledMap(), properties: crop(0, 0, 64, 48).slice(0, 3) },
        /a crop needs all of crop-x, crop-y, crop-width, crop-height/,
      ],
      [
        'a crop in fractions of pixels',
        { ...tiledMap(), properties: crop(0.5, 0, 64, 48) },
        /crop-x\): expected a whole number of pixels/,
      ],
      [
        'a crop out of the exported image',
        { ...tiledMap(), properties: crop(96, 0, 64, 48) },
        /the crop must lie within the exported image \(128 x 96\)/,
      ],
    ];

    it.each(invalid)('%s', (_, data, message) => {
      expect(() => parseTiledMap(data, options)).toThrow(message);
    });
  });
});
