import type { PointerEvent, RefObject } from 'react';
import { useEffect, useState } from 'react';
import { ui } from '../content';
import type { Direction } from '../engine/input';
import { DIRECTIONS, padDirections } from '../engine/input';
import './TouchPad.css';

const NONE: ReadonlySet<Direction> = new Set();

function sameDirections(a: ReadonlySet<Direction>, b: ReadonlySet<Direction>): boolean {
  return a.size === b.size && [...a].every((direction) => b.has(direction));
}

/**
 * Touch controls, shown on coarse pointers only (CSS). The cross is a single
 * surface: sliding the finger changes direction, diagonals included.
 */
export function TouchPad({
  directionsRef,
  onAction,
  enabled,
}: {
  /** Shared with the game loop. */
  directionsRef: RefObject<ReadonlySet<Direction>>;
  onAction: () => void;
  /** False while the game is paused (a dialog is open): held directions are dropped. */
  enabled: boolean;
}) {
  const [active, setActive] = useState<ReadonlySet<Direction>>(NONE);
  const [wasEnabled, setWasEnabled] = useState(enabled);
  if (enabled !== wasEnabled) {
    setWasEnabled(enabled);
    if (!enabled) setActive(NONE);
  }

  // A dialog makes the pad inert: a finger lifted meanwhile may never send its pointerup.
  useEffect(() => {
    if (!enabled) directionsRef.current = NONE;
  }, [enabled, directionsRef]);

  const press = (next: ReadonlySet<Direction>) => {
    // pointermove fires many times per second: only a change of direction re-renders.
    if (sameDirections(next, directionsRef.current)) return;
    directionsRef.current = next;
    setActive(next);
  };

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    press(
      padDirections(
        event.clientX - (rect.left + rect.width / 2),
        event.clientY - (rect.top + rect.height / 2),
        rect.width / 2,
      ),
    );
  };

  const release = () => {
    press(NONE);
  };

  return (
    <div className="touch-pad" role="group" aria-label={ui.touch.label}>
      <div
        className="touch-pad__cross"
        aria-hidden="true"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          track(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) track(event);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        {DIRECTIONS.map((direction) => (
          <span
            key={direction}
            className={`touch-pad__arm touch-pad__arm--${direction}`}
            data-active={active.has(direction) ? '' : undefined}
          />
        ))}
      </div>
      <button
        type="button"
        className="touch-pad__action"
        aria-label={ui.touch.action}
        // Acts as soon as the finger lands: with a second finger on A while the
        // first one holds the cross, the browser never sends a click.
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          onAction();
        }}
        // Keyboard activation only (Enter or Space on the focused button: detail 0).
        onClick={(event) => {
          if (event.detail === 0) onAction();
        }}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        {ui.touch.actionKey}
      </button>
    </div>
  );
}
