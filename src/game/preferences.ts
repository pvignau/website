import type { ZoomLevel } from '../engine/zoom';
import { parseZoomLevel } from '../engine/zoom';
import { createPreference, getLocalStorage } from '../lib/storage';

const storage = getLocalStorage();

/** Zoom level last chosen, on either map. */
export const ZOOM_KEY = 'pyve:zoom:v1';

export const zoomPreference = createPreference<ZoomLevel>(storage, ZOOM_KEY, {
  parse: parseZoomLevel,
  format: String,
});

/** Whether the minimap shows; nothing stored, it shows where the screen has room for it. */
export const MINIMAP_KEY = 'pyve:minimap:v1';

export const minimapPreference = createPreference<boolean>(storage, MINIMAP_KEY, {
  parse: (raw) => (raw === 'shown' ? true : raw === 'hidden' ? false : null),
  format: (shown) => (shown ? 'shown' : 'hidden'),
});
