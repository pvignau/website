import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import { META_GROUP } from '../src/engine/tiledMeta.ts';

/** Import suffix handled by this plugin: `import map from './maps/world.json?tiled'`. */
export const TILED_QUERY = '?tiled';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stripLayer(layer: unknown, keepData: boolean): unknown {
  if (!isRecord(layer)) return layer;
  if (layer.type === 'group' && Array.isArray(layer.layers)) {
    return { ...layer, layers: layer.layers.map((child) => stripLayer(child, keepData)) };
  }
  if (layer.type === 'tilelayer' && !keepData) {
    const { data: _data, ...metadata } = layer;
    return metadata;
  }
  return layer;
}

/**
 * Drops what the runtime never reads from a Tiled map: tilesets and the tile
 * data of visual layers, which are pre-rendered in the background image.
 * Layer metadata (names, offsets) is kept: the background placement needs it.
 */
export function stripVisualData(map: unknown): unknown {
  if (!isRecord(map) || !Array.isArray(map.layers)) return map;
  const { tilesets: _tilesets, ...rest } = map;
  return {
    ...rest,
    layers: map.layers.map((layer) =>
      stripLayer(layer, isRecord(layer) && layer.name === META_GROUP),
    ),
  };
}

const VIRTUAL_PREFIX = '\0tiled:';
/** Ends the virtual id with .js: Vite's JSON plugin claims every id ending with .json. */
const VIRTUAL_SUFFIX = '.js';

/**
 * Serves `*.json?tiled` imports as Tiled maps reduced to what the engine
 * reads: world.json goes from about 850 kB to about 90 kB in the bundle.
 */
export function tiledMap(): Plugin {
  return {
    name: 'pyve:tiled-map',
    enforce: 'pre',
    async resolveId(source, importer) {
      const [path = '', query = ''] = source.split('?');
      if (!new URLSearchParams(query).has(TILED_QUERY.slice(1))) return null;
      const resolved = await this.resolve(path, importer, { skipSelf: true });
      return resolved ? `${VIRTUAL_PREFIX}${resolved.id}${VIRTUAL_SUFFIX}` : null;
    },
    async load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;
      const file = id.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);
      this.addWatchFile(file);
      const map: unknown = JSON.parse(await readFile(file, 'utf8'));
      const json = JSON.stringify(stripVisualData(map));
      // JSON.parse() of a string literal is faster to evaluate than a large object literal.
      return `export default JSON.parse(${JSON.stringify(json)});\n`;
    },
  };
}
