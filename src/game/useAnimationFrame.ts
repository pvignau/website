import { useEffect, useLayoutEffect, useRef } from 'react';

/** Longest step simulated in one frame: after a stall the hero never jumps across a wall. */
export const MAX_FRAME_SECONDS = 0.05;

/**
 * Calls `onFrame(deltaSeconds)` on every animation frame while `active`.
 * The first frame after (re)starting gets a delta of 0, so pausing never
 * produces a jump. The loop is cancelled on pause and unmount.
 */
export function useAnimationFrame(onFrame: (deltaSeconds: number) => void, active: boolean): void {
  const callback = useRef(onFrame);
  useLayoutEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      const delta = last === null ? 0 : Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
      last = now;
      callback.current(delta);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [active]);
}
