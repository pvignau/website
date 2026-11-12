import { describe, expect, it } from 'vitest';
import type { StorageLike } from './storage';
import { createPreference } from './storage';

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
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

const failing: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

const digit = {
  parse: (raw: string) => (/^\d$/.test(raw) ? Number(raw) : null),
  format: String,
};

describe('createPreference', () => {
  it('stores the value and reads it back', () => {
    const storage = memoryStorage();
    createPreference(storage, 'test:pref', digit).set(7);
    expect(storage.data.get('test:pref')).toBe('7');
    // A new visit reads what the last one chose.
    expect(createPreference(storage, 'test:pref', digit).get()).toBe(7);
  });

  it('reads nothing when nothing is stored', () => {
    expect(createPreference(memoryStorage(), 'test:pref', digit).get()).toBeNull();
  });

  it('reads a value it cannot parse as nothing', () => {
    const storage = memoryStorage();
    storage.setItem('test:pref', 'seven');
    expect(createPreference(storage, 'test:pref', digit).get()).toBeNull();
  });

  it('keeps the value for the visit when there is no storage', () => {
    const preference = createPreference(null, 'test:pref', digit);
    expect(preference.get()).toBeNull();
    preference.set(3);
    expect(preference.get()).toBe(3);
  });

  it('survives a storage that throws, losing the value only', () => {
    const preference = createPreference(failing, 'test:pref', digit);
    expect(() => {
      preference.set(3);
    }).not.toThrow();
    expect(preference.get()).toBeNull();
  });
});
