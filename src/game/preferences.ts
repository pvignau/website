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
