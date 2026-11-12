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

/** A setting the visitor chose, kept between visits. */
export interface Preference<T> {
  /** The chosen value; null when none was (or none can be read back). */
  get: () => T | null;
  set: (value: T) => void;
}

/**
 * A setting stored under `key`. A stored value that does not parse (older
 * format, manual edit) reads as none. Without storage (blocked cookies), the
 * setting still holds for the rest of the visit, from one map to the other.
 */
export function createPreference<T>(
  storage: StorageLike | null,
  key: string,
  { parse, format }: { parse: (raw: string) => T | null; format: (value: T) => string },
): Preference<T> {
  let thisVisit: T | null = null;
  return {
    get: () => {
      if (storage === null) return thisVisit;
      const raw = readStorage(storage, key);
      return raw === null ? null : parse(raw);
    },
    set: (value) => {
      thisVisit = value;
      writeStorage(storage, key, format(value));
    },
  };
}
