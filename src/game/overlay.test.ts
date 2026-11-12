import { describe, expect, it } from 'vitest';
import { overlayOf, overlayPlace, overlayView } from './overlay';

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

describe('overlayView', () => {
  it('reads the view of the place an entry shows', () => {
    expect(overlayView({ overlay: 'home', view: 'office' })).toBe('office');
    expect(overlayView({ overlay: 'home' })).toBeNull();
  });

  it('reads no view from other entries, or an unknown one', () => {
    for (const state of [
      null,
      { overlay: 'help', view: 'office' },
      { overlay: 'shop', view: 'office' },
      { overlay: 'home', view: 'attic' },
      { overlay: 'home', view: 3 },
    ]) {
      expect(overlayView(state), JSON.stringify(state)).toBeNull();
    }
  });
});
