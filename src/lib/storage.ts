/** The part of the Web Storage API the app uses. */
export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/**
 * localStorage, or null where it is unavailable: blocked cookies, some
 * private modes, sandboxed iframes. Callers then simply do not persist.
 */
export function getLocalStorage(): StorageLike | null {
  try {
    const storage = window.localStorage;
    const probe = '__pyve_probe__';
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

/** Reads a stored value; any storage error reads as "nothing stored". */
export function readStorage(storage: StorageLike | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Writes a stored value; a full or blocked storage only loses persistence. */
export function writeStorage(storage: StorageLike | null, key: string, value: string | null): void {
  try {
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, value);
  } catch {
    // Quota exceeded or storage blocked: keep working without persistence.
  }
}
