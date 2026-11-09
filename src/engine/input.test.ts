import { describe, expect, it } from 'vitest';
import type { Direction } from './input';
import {
  directionFromKey,
  directionVector,
  isHelpKey,
  isInteractKey,
  padDirections,
  resolveFacing,
  zoomFromKey,
} from './input';

const key = (code: string, value: string) => ({ code, key: value });

describe('directionFromKey', () => {
  it('maps the arrow keys', () => {
    expect(directionFromKey(key('ArrowUp', 'ArrowUp'))).toBe('up');
    expect(directionFromKey(key('ArrowLeft', 'ArrowLeft'))).toBe('left');
  });

  it('maps ZQSD on AZERTY and WASD on QWERTY, which are the same physical keys', () => {
    // AZERTY: the key printing "z" sits where QWERTY has "w".
    expect(directionFromKey(key('KeyW', 'z'))).toBe('up');
    expect(directionFromKey(key('KeyA', 'q'))).toBe('left');
    // QWERTY.
    expect(directionFromKey(key('KeyW', 'w'))).toBe('up');
    expect(directionFromKey(key('KeyA', 'a'))).toBe('left');
    expect(directionFromKey(key('KeyS', 's'))).toBe('down');
    expect(directionFromKey(key('KeyD', 'd'))).toBe('right');
  });

  it('falls back on the character when the keyboard reports no code', () => {
    expect(directionFromKey(key('', 'Z'))).toBe('up');
    expect(directionFromKey(key('', 'q'))).toBe('left');
  });

  it('ignores other keys', () => {
    expect(directionFromKey(key('KeyE', 'e'))).toBeNull();
    expect(directionFromKey(key('Tab', 'Tab'))).toBeNull();
  });
});

describe('action keys', () => {
  it('interacts with Space or Enter', () => {
    expect(isInteractKey(key('Space', ' '))).toBe(true);
    expect(isInteractKey(key('Enter', 'Enter'))).toBe(true);
    expect(isInteractKey(key('NumpadEnter', 'Enter'))).toBe(true);
    expect(isInteractKey(key('KeyE', 'e'))).toBe(false);
  });

  it('opens the help with "?" whatever the layout', () => {
    expect(isHelpKey({ key: '?' })).toBe(true);
    expect(isHelpKey({ key: ',' })).toBe(false);
  });

  it('zooms in with + (or =, its key without Shift) and out with -, keypad included', () => {
    expect(zoomFromKey(key('Equal', '+'))).toBe(1);
    expect(zoomFromKey(key('Equal', '='))).toBe(1);
    expect(zoomFromKey(key('NumpadAdd', '+'))).toBe(1);
    expect(zoomFromKey(key('Minus', '-'))).toBe(-1);
    // AZERTY: "-" is on the 6 key.
    expect(zoomFromKey(key('Digit6', '-'))).toBe(-1);
    expect(zoomFromKey(key('NumpadSubtract', '-'))).toBe(-1);
    expect(zoomFromKey(key('Digit6', '6'))).toBeNull();
    expect(zoomFromKey(key('Slash', '_'))).toBeNull();
  });
});

describe('directionVector', () => {
  const vector = (...pressed: Direction[]) => directionVector(new Set(pressed));

  it('combines directions and cancels opposite ones', () => {
    expect(vector()).toEqual({ x: 0, y: 0 });
    expect(vector('up', 'right')).toEqual({ x: 1, y: -1 });
    expect(vector('left', 'right', 'down')).toEqual({ x: 0, y: 1 });
  });
});

describe('resolveFacing', () => {
  it('faces the direction of a straight move', () => {
    expect(resolveFacing('down', { x: -1, y: 0 })).toBe('left');
    expect(resolveFacing('left', { x: 0, y: -1 })).toBe('up');
  });

  it('keeps the current facing when idle', () => {
    expect(resolveFacing('right', { x: 0, y: 0 })).toBe('right');
  });

  it('keeps a matching facing on diagonals, and prefers the vertical one otherwise', () => {
    expect(resolveFacing('right', { x: 1, y: -1 })).toBe('right');
    expect(resolveFacing('up', { x: 1, y: -1 })).toBe('up');
    expect(resolveFacing('left', { x: 1, y: 1 })).toBe('down');
  });
});

describe('padDirections', () => {
  const pad = (dx: number, dy: number) => [...padDirections(dx, dy, 100)].sort();

  it('ignores the dead zone in the middle of the cross', () => {
    expect(pad(0, 0)).toEqual([]);
    expect(pad(10, -10)).toEqual([]);
  });

  it('reads the four arms', () => {
    expect(pad(0, -80)).toEqual(['up']);
    expect(pad(80, 5)).toEqual(['right']);
    expect(pad(-80, 0)).toEqual(['left']);
    expect(pad(3, 90)).toEqual(['down']);
  });

  it('reads diagonals between two arms', () => {
    expect(pad(60, -60)).toEqual(['right', 'up']);
    expect(pad(-50, 55)).toEqual(['down', 'left']);
  });
});
