import { describe, expect, it } from 'vitest';
import { content, isPlaceId, PLACE_IDS, ui } from '.';

describe('content entry point', () => {
  it('lists every place of the content, in display order', () => {
    expect([...PLACE_IDS].sort()).toEqual(Object.keys(content.places).sort());
    expect(PLACE_IDS[0]).toBe('home');
  });

  it('recognises place ids', () => {
    expect(isPlaceId('lab')).toBe(true);
    expect(isPlaceId('shop')).toBe(false);
    expect(isPlaceId('toString')).toBe(false);
  });

  it('tells touch players about the A button the HUD talks about', () => {
    const touch = content.help.steps.find((step) => step.includes(ui.touch.actionKey));
    expect(touch).toMatch(/bouton A/);
  });

  it('builds page titles from the site name', () => {
    expect(ui.pageTitle(null)).toContain(ui.siteName);
    expect(ui.pageTitle(content.notFound.title)).toBe(`${content.notFound.title} · ${ui.siteName}`);
  });
});
