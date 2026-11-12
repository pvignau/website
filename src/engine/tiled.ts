/**
 * Turns a Tiled JSON map into the engine's map model.
 *
 * The visual layers are pre-rendered in the map's background image
 * (tools/map-art); the engine only reads the `meta` group:
 * - a tile layer whose `action` property is `collision`: solid tiles;
 * - object layers: interactive objects, decorations and spawn points, see
 *   `MapObjectAction`.
 *
 * The background may be a part only of the image Tiled would export: the map
 * properties `crop-x`, `crop-y`, `crop-width` and `crop-height` give it, in
 * pixels of that export (which grows to fit layer offsets).
 */
import type { CollisionGrid } from './collision';
import { createCollisionGrid } from './collision';
import type { Rect, Vec2 } from './geometry';
import type { Direction } from './input';
import { isDirection } from './input';
import { META_GROUP } from './tiledMeta';

/** Interaction distance, in map pixels, when an object has no `radius` property. */
export const DEFAULT_INTERACTION_RADIUS = 24;

/** Value of an object's `action` property (or of its Tiled class). */
export type MapObjectAction = 'place' | 'redirect' | 'note' | 'spawn' | 'decor';

const ACTIONS: readonly MapObjectAction[] = ['place', 'redirect', 'note', 'spawn', 'decor'];

/**
 * Opens the dialog of a place. The object is named after the place id; its
 * `view` property, if any, names the view of the place it opens.
 */
export interface PlaceObject<P extends string> {
  readonly kind: 'place';
  readonly id: string;
  readonly name: string;
  readonly placeId: P;
  readonly view: string | null;
  readonly rect: Rect;
  readonly radius: number;
}

/** Leads to another route. Named after a place id, it borrows that place's label and zone. */
export interface WarpObject<P extends string> {
  readonly kind: 'warp';
  readonly id: string;
  readonly name: string;
  readonly to: string;
  readonly placeId: P | null;
  readonly rect: Rect;
  readonly radius: number;
}

/**
 * Says one sentence in the HUD when inspected: no dialog, no quest. The object
 * is named after a note id of the content (checked when the map is parsed).
 */
export interface NoteObject {
  readonly kind: 'note';
  readonly id: string;
  readonly name: string;
  readonly noteId: string;
  readonly rect: Rect;
  readonly radius: number;
}

export type Interactable<P extends string> = PlaceObject<P> | WarpObject<P> | NoteObject;

/** Purely visual overlay drawn by the engine (e.g. blinking LEDs), named by its `value`. */
export interface Decoration {
  readonly id: string;
  readonly kind: string;
  readonly rect: Rect;
}

export interface SpawnPoint {
  readonly name: string;
  /** Route this spawn serves: the route the hero comes from, or the deep link that was opened. `null` for the default spawn. */
  readonly entry: string | null;
  /** Position of the hero's feet. */
  readonly position: Vec2;
  readonly facing: Direction;
}

export interface GameMap<P extends string = string> {
  /** Map size in map pixels. */
  readonly width: number;
  readonly height: number;
  readonly tileSize: number;
  readonly collisions: CollisionGrid;
  readonly interactables: readonly Interactable<P>[];
  readonly decorations: readonly Decoration[];
  readonly spawns: readonly SpawnPoint[];
  /**
   * Where the background image sits, in map pixels. Tiled grows the exported
   * image to fit layer offsets, so its origin can be negative; the crop-*
   * map properties keep only a part of it.
   */
  readonly background: Rect;
}

export class TiledMapError extends Error {
  constructor(path: string, message: string) {
    super(`Invalid Tiled map (${path}): ${message}`);
    this.name = 'TiledMapError';
  }
}

export interface ParseOptions<P extends string> {
  /** Valid place ids: a `place` object with another name is a data error. */
  readonly placeIds: readonly P[];
  /** Valid note ids, likewise for `note` objects. */
  readonly noteIds?: readonly string[];
  /** Valid views of a place, likewise for the `view` property of `place` objects. */
  readonly viewIds?: readonly string[];
}

type JsonObject = Readonly<Record<string, unknown>>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectObject(value: unknown, path: string): JsonObject {
  if (!isObject(value)) throw new TiledMapError(path, 'expected an object');
  return value;
}

function expectArray(value: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(value)) throw new TiledMapError(path, 'expected an array');
  return value;
}

function expectNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TiledMapError(path, 'expected a number');
  }
  return value;
}

function expectPositiveInteger(value: unknown, path: string): number {
  const number = expectNumber(value, path);
  if (!Number.isInteger(number) || number <= 0) {
    throw new TiledMapError(path, 'expected a positive integer');
  }
  return number;
}

function optionalNumber(value: unknown, path: string): number {
  return value === undefined ? 0 : expectNumber(value, path);
}

function readProperties(value: unknown, path: string): ReadonlyMap<string, unknown> {
  const properties = new Map<string, unknown>();
  if (value === undefined) return properties;
  expectArray(value, path).forEach((entry, index) => {
    const property = expectObject(entry, `${path}[${index}]`);
    if (typeof property.name !== 'string') {
      throw new TiledMapError(`${path}[${index}].name`, 'expected a string');
    }
    properties.set(property.name, property.value);
  });
  return properties;
}

function stringProperty(
  properties: ReadonlyMap<string, unknown>,
  name: string,
  path: string,
): string | undefined {
  const value = properties.get(name);
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new TiledMapError(`${path}.${name}`, 'expected a string');
  return value;
}

interface WalkedLayer {
  readonly layer: JsonObject;
  readonly path: string;
  readonly offset: Vec2;
}

/** Flattens groups, accumulating their offsets like Tiled does when rendering. */
function walkLayers(layers: readonly unknown[], path: string, parentOffset: Vec2): WalkedLayer[] {
  return layers.flatMap((entry, index) => {
    const layerPath = `${path}[${index}]`;
    const layer = expectObject(entry, layerPath);
    const offset = {
      x: parentOffset.x + optionalNumber(layer.offsetx, `${layerPath}.offsetx`),
      y: parentOffset.y + optionalNumber(layer.offsety, `${layerPath}.offsety`),
    };
    if (layer.type === 'group') {
      return walkLayers(
        expectArray(layer.layers, `${layerPath}.layers`),
        `${layerPath}.layers`,
        offset,
      );
    }
    return [{ layer, path: layerPath, offset }];
  });
}

function backgroundRect(visualLayers: readonly WalkedLayer[], width: number, height: number): Rect {
  const offsets = visualLayers
    .filter(({ layer }) => layer.type === 'tilelayer')
    .map(({ offset }) => offset);
  const left = Math.floor(Math.min(0, ...offsets.map(({ x }) => x)));
  const top = Math.floor(Math.min(0, ...offsets.map(({ y }) => y)));
  const right = Math.ceil(Math.max(0, ...offsets.map(({ x }) => x)));
  const bottom = Math.ceil(Math.max(0, ...offsets.map(({ y }) => y)));
  return { x: left, y: top, width: width - left + right, height: height - top + bottom };
}

const CROP = ['crop-x', 'crop-y', 'crop-width', 'crop-height'] as const;

/** The part of the exported image kept as the background (crop-* map properties), if any. */
function cropBackground(exported: Rect, properties: ReadonlyMap<string, unknown>): Rect {
  const given = CROP.filter((name) => properties.has(name));
  if (given.length === 0) return exported;
  if (given.length < CROP.length) {
    throw new TiledMapError('map.properties', `a crop needs all of ${CROP.join(', ')}`);
  }
  const pixels = (name: (typeof CROP)[number]): number => {
    const value = properties.get(name);
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new TiledMapError(`map.properties.${name}`, 'expected a whole number of pixels');
    }
    return value;
  };
  const [x, y, width, height] = [
    pixels('crop-x'),
    pixels('crop-y'),
    pixels('crop-width'),
    pixels('crop-height'),
  ];
  if (width === 0 || height === 0 || x + width > exported.width || y + height > exported.height) {
    throw new TiledMapError(
      'map.properties',
      `the crop must lie within the exported image (${exported.width} x ${exported.height})`,
    );
  }
  return { x: exported.x + x, y: exported.y + y, width, height };
}

function objectRect(object: JsonObject, path: string): Rect {
  return {
    x: expectNumber(object.x, `${path}.x`),
    y: expectNumber(object.y, `${path}.y`),
    width: optionalNumber(object.width, `${path}.width`),
    height: optionalNumber(object.height, `${path}.height`),
  };
}

function readAction(
  object: JsonObject,
  properties: ReadonlyMap<string, unknown>,
  path: string,
): MapObjectAction {
  const declared =
    stringProperty(properties, 'action', path) ??
    (typeof object.type === 'string' && object.type !== '' ? object.type : undefined) ??
    (typeof object.class === 'string' && object.class !== '' ? object.class : undefined);
  const action = ACTIONS.find((candidate) => candidate === declared);
  if (action) return action;
  throw new TiledMapError(
    path,
    `unknown action ${JSON.stringify(declared)}, expected one of ${ACTIONS.join(', ')}`,
  );
}

function readRoute(properties: ReadonlyMap<string, unknown>, path: string): string | undefined {
  const route = stringProperty(properties, 'value', path);
  if (route !== undefined && !route.startsWith('/')) {
    throw new TiledMapError(`${path}.value`, `route ${JSON.stringify(route)} must start with "/"`);
  }
  return route;
}

export function parseTiledMap<P extends string>(
  input: unknown,
  options: ParseOptions<P>,
): GameMap<P> {
  const map = expectObject(input, 'map');
  if (map.orientation !== 'orthogonal')
    throw new TiledMapError('map.orientation', 'only orthogonal maps are supported');
  if (map.infinite === true)
    throw new TiledMapError('map.infinite', 'infinite maps are not supported');

  const columns = expectPositiveInteger(map.width, 'map.width');
  const rows = expectPositiveInteger(map.height, 'map.height');
  const tileSize = expectPositiveInteger(map.tilewidth, 'map.tilewidth');
  if (map.tileheight !== tileSize)
    throw new TiledMapError('map.tileheight', 'tiles must be square');

  const topLayers = expectArray(map.layers, 'map.layers');
  const metaIndex = topLayers.findIndex((layer) => isObject(layer) && layer.name === META_GROUP);
  const metaGroup = topLayers[metaIndex];
  if (!isObject(metaGroup) || metaGroup.type !== 'group') {
    throw new TiledMapError('map.layers', `missing the "${META_GROUP}" group`);
  }

  const visualLayers = walkLayers(
    topLayers.filter((_, index) => index !== metaIndex),
    'map.layers',
    { x: 0, y: 0 },
  );
  const metaPath = `map.layers[${metaIndex}].layers`;
  const metaLayers = walkLayers(expectArray(metaGroup.layers, metaPath), metaPath, { x: 0, y: 0 });

  const solid = new Uint8Array(columns * rows);
  let hasCollisionLayer = false;
  const interactables: Interactable<P>[] = [];
  const decorations: Decoration[] = [];
  const spawns: SpawnPoint[] = [];

  for (const { layer, path, offset } of metaLayers) {
    const properties = readProperties(layer.properties, `${path}.properties`);

    if (layer.type === 'tilelayer') {
      const action = stringProperty(properties, 'action', `${path}.properties`);
      if (action !== 'collision') {
        throw new TiledMapError(
          path,
          `tile layer "${String(layer.name)}" has action ${JSON.stringify(action)}; only "collision" tile layers are supported, use objects for the rest`,
        );
      }
      if (offset.x !== 0 || offset.y !== 0)
        throw new TiledMapError(path, 'collision layers cannot be offset');
      const data = expectArray(layer.data, `${path}.data`);
      if (layer.width !== columns || layer.height !== rows || data.length !== columns * rows) {
        throw new TiledMapError(path, 'collision layer must cover the whole map');
      }
      data.forEach((cell, index) => {
        if (expectNumber(cell, `${path}.data[${index}]`) !== 0) solid[index] = 1;
      });
      hasCollisionLayer = true;
      continue;
    }

    if (layer.type !== 'objectgroup') continue;

    expectArray(layer.objects, `${path}.objects`).forEach((entry, index) => {
      const objectPath = `${path}.objects[${index}]`;
      const object = expectObject(entry, objectPath);
      const objectProperties = readProperties(object.properties, `${objectPath}.properties`);
      const name = typeof object.name === 'string' ? object.name : '';
      const id = String(expectNumber(object.id, `${objectPath}.id`));
      const local = objectRect(object, objectPath);
      const rect = { ...local, x: local.x + offset.x, y: local.y + offset.y };
      const radiusProperty = objectProperties.get('radius');
      const radius =
        radiusProperty === undefined
          ? DEFAULT_INTERACTION_RADIUS
          : expectNumber(radiusProperty, `${objectPath}.properties.radius`);
      const placeId = options.placeIds.find((candidate) => candidate === name) ?? null;

      switch (readAction(object, objectProperties, objectPath)) {
        case 'place': {
          if (placeId === null) {
            throw new TiledMapError(objectPath, `place object "${name}" is not a known place id`);
          }
          if (rect.width <= 0 || rect.height <= 0) {
            throw new TiledMapError(objectPath, 'a place needs a rectangle, not a point');
          }
          const view = stringProperty(objectProperties, 'view', `${objectPath}.properties`) ?? null;
          if (view !== null && !options.viewIds?.includes(view)) {
            throw new TiledMapError(
              objectPath,
              `place object "${name}" has an unknown view "${view}"`,
            );
          }
          interactables.push({ kind: 'place', id, name, placeId, view, rect, radius });
          break;
        }
        case 'redirect': {
          const to = readRoute(objectProperties, `${objectPath}.properties`);
          if (to === undefined)
            throw new TiledMapError(objectPath, 'a redirect needs a "value" route');
          if (rect.width <= 0 || rect.height <= 0) {
            throw new TiledMapError(objectPath, 'a redirect needs a rectangle, not a point');
          }
          interactables.push({ kind: 'warp', id, name, to, placeId, rect, radius });
          break;
        }
        case 'note': {
          if (!options.noteIds?.includes(name)) {
            throw new TiledMapError(objectPath, `note object "${name}" is not a known note id`);
          }
          if (rect.width <= 0 || rect.height <= 0) {
            throw new TiledMapError(objectPath, 'a note needs a rectangle, not a point');
          }
          interactables.push({ kind: 'note', id, name, noteId: name, rect, radius });
          break;
        }
        case 'decor': {
          const kind = stringProperty(objectProperties, 'value', `${objectPath}.properties`);
          if (!kind) throw new TiledMapError(objectPath, 'a decor needs a "value" naming it');
          decorations.push({ id, kind, rect });
          break;
        }
        case 'spawn': {
          const direction = objectProperties.get('direction') ?? 'down';
          if (!isDirection(direction)) {
            throw new TiledMapError(
              `${objectPath}.properties.direction`,
              'expected up, down, left or right',
            );
          }
          spawns.push({
            name,
            entry: readRoute(objectProperties, `${objectPath}.properties`) ?? null,
            position: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
            facing: direction,
          });
          break;
        }
      }
    });
  }

  if (!hasCollisionLayer) throw new TiledMapError(metaPath, 'missing a "collision" tile layer');
  const defaults = spawns.filter((spawn) => spawn.entry === null);
  if (defaults.length !== 1) {
    throw new TiledMapError(
      metaPath,
      `expected exactly one default spawn, found ${defaults.length}`,
    );
  }

  const width = columns * tileSize;
  const height = rows * tileSize;
  return {
    width,
    height,
    tileSize,
    collisions: createCollisionGrid(columns, rows, tileSize, solid),
    interactables,
    decorations,
    spawns,
    background: cropBackground(
      backgroundRect(visualLayers, width, height),
      readProperties(map.properties, 'map.properties'),
    ),
  };
}

/** Spawn for an arrival route, falling back to the map's default spawn. */
export function findSpawn(map: GameMap, entry: string | null): SpawnPoint {
  const match = entry === null ? undefined : map.spawns.find((spawn) => spawn.entry === entry);
  const fallback = map.spawns.find((spawn) => spawn.entry === null);
  const spawn = match ?? fallback;
  if (!spawn) throw new Error('Map has no default spawn.');
  return spawn;
}
