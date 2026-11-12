import type { StorageLike } from '../lib/storage';
import { readStorage, writeStorage } from '../lib/storage';

export const QUEST_STORAGE_KEY = 'pyve:quest:v1';

/** Visited places, persisted between visits; subscribe() fits useSyncExternalStore. */
export interface QuestStore<P extends string> {
  /** Visited place ids, in quest order. Same array until something changes. */
  getSnapshot: () => readonly P[];
  subscribe: (listener: () => void) => () => void;
  markVisited: (id: P) => void;
  reset: () => void;
  /** Re-reads the storage, e.g. after another tab changed it. */
  refresh: () => void;
}

interface QuestStoreOptions<P extends string> {
  storage: StorageLike | null;
  /** Every place of the quest, in display order. */
  placeIds: readonly P[];
  key?: string;
}

export function createQuestStore<P extends string>({
  storage,
  placeIds,
  key = QUEST_STORAGE_KEY,
}: QuestStoreOptions<P>): QuestStore<P> {
  /** Unknown or malformed data (old version, manual edit) reads as an empty quest. */
  const load = (): readonly P[] => {
    const raw = readStorage(storage, key);
    if (raw === null) return [];
    try {
      const stored: unknown = JSON.parse(raw);
      if (!Array.isArray(stored)) return [];
      return placeIds.filter((id) => stored.includes(id));
    } catch {
      return [];
    }
  };

  let visited = load();
  const listeners = new Set<() => void>();
  const update = (next: readonly P[], persist: boolean) => {
    if (next.length === visited.length && next.every((id, index) => visited[index] === id)) return;
    visited = next;
    if (persist) writeStorage(storage, key, next.length > 0 ? JSON.stringify(next) : null);
    listeners.forEach((listener) => {
      listener();
    });
  };

  return {
    getSnapshot: () => visited,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    markVisited(id) {
      update(
        placeIds.filter((place) => place === id || visited.includes(place)),
        true,
      );
    },
    reset() {
      update([], true);
    },
    refresh() {
      update(load(), false);
    },
  };
}
