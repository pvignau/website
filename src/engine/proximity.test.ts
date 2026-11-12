import { describe, expect, it } from 'vitest';
import { findNearest } from './proximity';

const sign = { name: 'sign', rect: { x: 100, y: 100, width: 32, height: 32 }, radius: 24 };
const door = { name: 'door', rect: { x: 160, y: 100, width: 64, height: 32 }, radius: 24 };

describe('findNearest', () => {
  it('returns nothing when no object is within its radius', () => {
    expect(findNearest([sign, door], { x: 0, y: 0 })).toBeNull();
    expect(findNearest([], { x: 100, y: 100 })).toBeNull();
  });

  it('measures the distance to the object zone, not to its centre', () => {
    expect(findNearest([sign], { x: 116, y: 156 })).toBe(sign);
    expect(findNearest([sign], { x: 116, y: 157 })).toBeNull();
    expect(findNearest([sign], { x: 110, y: 110 })).toBe(sign);
  });

  it('picks the closest object when several are in range', () => {
    expect(findNearest([sign, door], { x: 140, y: 116 })).toBe(sign);
    expect(findNearest([sign, door], { x: 150, y: 116 })).toBe(door);
  });

  it('honours each object radius', () => {
    const boat = { ...door, radius: 40 };
    expect(findNearest([boat], { x: 160, y: 168 })).toBe(boat);
    expect(findNearest([door], { x: 160, y: 168 })).toBeNull();
  });

  it('keeps the first object on a tie', () => {
    const twin = { ...sign, name: 'twin' };
    expect(findNearest([sign, twin], { x: 116, y: 140 })).toBe(sign);
  });
});
