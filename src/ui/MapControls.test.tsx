import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ui } from '../content';
import { MapControls } from './MapControls';

function setup({ canZoomIn = true, canZoomOut = true } = {}) {
  const onZoom = vi.fn();
  render(<MapControls canZoomIn={canZoomIn} canZoomOut={canZoomOut} onZoom={onZoom} />);
  return {
    onZoom,
    zoomIn: screen.getByRole('button', { name: ui.mapControls.zoomIn }),
    zoomOut: screen.getByRole('button', { name: ui.mapControls.zoomOut }),
  };
}

describe('MapControls', () => {
  it('groups named zoom buttons, with their keys', () => {
    const { zoomIn, zoomOut } = setup();
    expect(screen.getByRole('group', { name: ui.mapControls.label })).toContainElement(zoomIn);
    expect(zoomIn).toHaveAttribute('aria-keyshortcuts', 'Plus');
    expect(zoomOut).toHaveAttribute('aria-keyshortcuts', '-');
    // The sign shows; the name is what screen readers say.
    expect(screen.getByText(ui.mapControls.zoomInSign)).toHaveAttribute('aria-hidden', 'true');
    expect(zoomIn).toHaveAttribute('title', ui.mapControls.zoomIn);
  });

  it('zooms in and out', async () => {
    const { onZoom, zoomIn, zoomOut } = setup();
    await userEvent.click(zoomIn);
    await userEvent.click(zoomOut);
    expect(onZoom.mock.calls).toEqual([[1], [-1]]);
  });

  it('turns a button off at the end of the range, keeping it focusable', async () => {
    const { onZoom, zoomIn, zoomOut } = setup({ canZoomIn: false });
    expect(zoomIn).toHaveAttribute('aria-disabled', 'true');
    expect(zoomIn).toBeEnabled();
    expect(zoomOut).not.toHaveAttribute('aria-disabled');

    zoomIn.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(zoomIn);
    expect(onZoom).not.toHaveBeenCalled();
    expect(zoomIn).toHaveFocus();
  });
});
