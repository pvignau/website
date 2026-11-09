import { describe, expect, it, vi } from 'vitest';
import type { StorageLike } from '../lib/storage';
import { createQuestStore, QUEST_STORAGE_KEY } from './questStore';

const PLACES = ['home', 'work', 'lab', 'contact'] as const;

function memoryStorage(
  initial: Record<string, string> = {},
): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

const brokenStorage: StorageLike = {
  getItem: () => {
    throw new DOMException('denied', 'SecurityError');
  },
  setItem: () => {
    throw new DOMException('full', 'QuotaExceededError');
  },
  removeItem: () => {
    throw new DOMException('denied', 'SecurityError');
  },
};

describe('quest store', () => {
  it('starts empty and remembers visits in storage', () => {
    const storage = memoryStorage();
    const quest = createQuestStore({ storage, placeIds: PLACES });
    expect(quest.getSnapshot()).toEqual([]);
    quest.markVisited('lab');
    quest.markVisited('home');
    expect(quest.getSnapshot()).toEqual(['home', 'lab']);
    expect(storage.data.get(QUEST_STORAGE_KEY)).toBe('["home","lab"]');
  });

  it('restores the progress of a previous visit', () => {
    const storage = memoryStorage({ [QUEST_STORAGE_KEY]: '["contact","work"]' });
    expect(createQuestStore({ storage, placeIds: PLACES }).getSnapshot()).toEqual([
      'work',
      'contact',
    ]);
  });

  it('ignores malformed or unknown stored data', () => {
    for (const raw of ['{', '"home"', '{"home":true}', '["home","shop",3]']) {
      const storage = memoryStorage({ [QUEST_STORAGE_KEY]: raw });
      const visited = createQuestStore({ storage, placeIds: PLACES }).getSnapshot();
      expect(visited, raw).toEqual(raw.includes('[') ? ['home'] : []);
    }
  });

  it('keeps working when storage is missing or throws', () => {
    for (const storage of [null, brokenStorage]) {
      const quest = createQuestStore({ storage, placeIds: PLACES });
      expect(quest.getSnapshot()).toEqual([]);
      expect(() => {
        quest.markVisited('work');
      }).not.toThrow();
      expect(quest.getSnapshot()).toEqual(['work']);
    }
  });

  it('notifies subscribers once per change, with a stable snapshot in between', () => {
    const quest = createQuestStore({ storage: memoryStorage(), placeIds: PLACES });
    const listener = vi.fn();
    const unsubscribe = quest.subscribe(listener);
    const before = quest.getSnapshot();
    expect(quest.getSnapshot()).toBe(before);

    quest.markVisited('work');
    quest.markVisited('work');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(quest.getSnapshot()).not.toBe(before);

    unsubscribe();
    quest.markVisited('lab');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('resets, and picks up changes made by another tab', () => {
    const storage = memoryStorage();
    const quest = createQuestStore({ storage, placeIds: PLACES });
    quest.markVisited('home');
    quest.reset();
    expect(quest.getSnapshot()).toEqual([]);
    expect(storage.data.has(QUEST_STORAGE_KEY)).toBe(false);

    storage.setItem(QUEST_STORAGE_KEY, '["lab"]');
    quest.refresh();
    expect(quest.getSnapshot()).toEqual(['lab']);
  });
});
