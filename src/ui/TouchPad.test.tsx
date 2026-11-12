import { fireEvent, render, screen } from '@testing-library/react';
import { Profiler } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ui } from '../content';
import type { Direction } from '../engine/input';
import { TouchPad } from './TouchPad';

// jsdom has no pointer capture: the cross only needs these two to exist.
beforeEach(() => {
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.hasPointerCapture = () => true;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 150, 150),
  );
});

afterEach(() => {
  // @ts-expect-error -- remove the stubs jsdom does not define
  delete HTMLElement.prototype.setPointerCapture;
  // @ts-expect-error -- remove the stubs jsdom does not define
  delete HTMLElement.prototype.hasPointerCapture;
});

function setup(enabled = true) {
  const directions: { current: ReadonlySet<Direction> } = { current: new Set() };
  const onAction = vi.fn();
  const onRender = vi.fn();
  const pad = (isEnabled: boolean) => (
    <Profiler id="pad" onRender={onRender}>
      <TouchPad directionsRef={directions} onAction={onAction} enabled={isEnabled} />
    </Profiler>
  );
  const { container, rerender } = render(pad(enabled));
  const cross = container.querySelector('.touch-pad__cross');
  if (!cross) throw new Error('No cross.');
  return {
    directions,
    onAction,
    onRender,
    cross,
    action: screen.getByRole('button', { name: ui.touch.action }),
    setEnabled: (value: boolean) => {
      rerender(pad(value));
    },
  };
}

describe('TouchPad', () => {
  it('names the action button after its visible letter', () => {
    const { action } = setup();
    expect(action).toHaveTextContent(ui.touch.actionKey);
    expect(ui.touch.action.startsWith(ui.touch.actionKey)).toBe(true);
  });

  it('acts as soon as a finger lands on A, even while another one holds the cross', () => {
    const { cross, action, onAction, directions } = setup();
    fireEvent.pointerDown(cross, { pointerId: 1, button: 0, clientX: 10, clientY: 75 });
    expect([...directions.current]).toEqual(['left']);

    fireEvent.pointerDown(action, { pointerId: 2, button: 0 });
    expect(onAction).toHaveBeenCalledTimes(1);
    // The click that may follow the same tap does not act twice...
    fireEvent.click(action, { detail: 1 });
    expect(onAction).toHaveBeenCalledTimes(1);
    // ...but a keyboard activation of the focused button does.
    fireEvent.click(action, { detail: 0 });
    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it('re-renders only when the finger changes direction', () => {
    const { cross, onRender } = setup();
    fireEvent.pointerDown(cross, { pointerId: 1, button: 0, clientX: 10, clientY: 75 });
    const renders = onRender.mock.calls.length;
    for (const clientX of [11, 12, 14, 18, 20]) {
      fireEvent.pointerMove(cross, { pointerId: 1, clientX, clientY: 75 });
    }
    expect(onRender).toHaveBeenCalledTimes(renders);
    fireEvent.pointerMove(cross, { pointerId: 1, clientX: 75, clientY: 10 });
    expect(onRender).toHaveBeenCalledTimes(renders + 1);
  });

  it('drops the held directions when the game pauses', () => {
    const { cross, directions, setEnabled } = setup();
    fireEvent.pointerDown(cross, { pointerId: 1, button: 0, clientX: 10, clientY: 75 });
    expect(directions.current.size).toBe(1);

    setEnabled(false);
    expect(directions.current.size).toBe(0);
    expect(document.querySelectorAll('[data-active]')).toHaveLength(0);
  });
});
