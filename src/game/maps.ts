import { PATHS } from '../app/pages';
import type { PlaceId } from '../content';
import { PLACE_IDS } from '../content';
import type { GameMap } from '../engine/tiled';
import { parseTiledMap } from '../engine/tiled';
import homeData from '../maps/home.json?tiled';
import homeImage from '../maps/home.webp';
import worldData from '../maps/world.json?tiled';
import worldImage from '../maps/world.webp';

export type MapId = 'world' | 'home';

export interface MapDefinition {
  readonly id: MapId;
  /** Route of the map; closing a place that has its own URL comes back here. */
  readonly path: string;
  /** Places with their own URL (deep link): opening one shows its URL, the URL opens it. */
  readonly placeRoutes: Readonly<Partial<Record<PlaceId, string>>>;
  readonly data: GameMap<PlaceId>;
  /** Background exported from Tiled (File > Export As Image). */
  readonly image: string;
  /** Colour around the map, visible when it is smaller than the screen. */
  readonly backdrop: string;
  /**
   * The sea goes on around the background image (src/img/sea.webp, four by four
   * of its tiles). The world image is cropped to what the camera shows on
   * common screens: past it, only sea tiles were left, and decoding them cost
   * about 40 MB of memory.
   */
  readonly sea: boolean;
  /** Place the whole map belongs to (its zone shows in the HUD); `null` outdoors. */
  readonly place: PlaceId | null;
  /**
   * Place whose dialog opens on arrival while it has never been visited. The
   * house greets you with the bio ("La porte grince..."); its desk reopens it.
   */
  readonly introPlace: PlaceId | null;
}

const options = { placeIds: PLACE_IDS };

/** Parsed once, when the module loads: a data error fails fast (and in the tests). */
export const MAPS: Readonly<Record<MapId, MapDefinition>> = {
  world: {
    id: 'world',
    path: PATHS.world,
    placeRoutes: { work: PATHS.work },
    data: parseTiledMap(worldData, options),
    image: worldImage,
    backdrop: '#67e6d2',
    sea: true,
    place: null,
    introPlace: null,
  },
  home: {
    id: 'home',
    path: PATHS.home,
    placeRoutes: {},
    data: parseTiledMap(homeData, options),
    image: homeImage,
    backdrop: '#241915',
    sea: false,
    place: 'home',
    introPlace: 'home',
  },
};
