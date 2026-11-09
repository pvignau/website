import { describe, expect, it } from 'vitest';
import { overlayOf, overlayPlace } from './overlay';

describe('overlayOf', () => {
  it('reads the overlay of an entry added by the game', () => {
    expect(overlayOf({ overlay: 'help' })).toBe('help');
    expect(overlayOf({ overlay: 'text' })).toBe('text');
    expect(overlayOf({ overlay: 'lab' })).toBe('lab');
  });

  it('reads nothing from other states, which history keeps across reloads', () => {
    for (const state of [
      null,
      undefined,
      'lab',
      { from: '/' },
      { overlay: 'shop' },
      { overlay: 3 },
    ]) {
      expect(overlayOf(state), JSON.stringify(state)).toBeNull();
    }
  });
});

describe('overlayPlace', () => {
  it('only gives places', () => {
    expect(overlayPlace('contact')).toBe('contact');
    expect(overlayPlace('help')).toBeNull();
    expect(overlayPlace(null)).toBeNull();
  });
});
