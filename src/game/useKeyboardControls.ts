import { useEffect, useLayoutEffect, useRef } from 'react';
import type { Direction } from '../engine/input';
import { directionFromKey, isHelpKey, isInteractKey, zoomFromKey } from '../engine/input';
import type { ZoomDirection } from '../engine/zoom';

interface KeyboardControls {
  /** False while a dialog is open: keys then belong to the page. */
  enabled: boolean;
  onInteract: () => void;
  onHelp: () => void;
  /** + or - pressed: one step per press, holding the key does not repeat it. */
  onZoom: (direction: ZoomDirection) => void;
}

/** Controls that react to both Space and Enter, or take text. */
const OWNS_SPACE_AND_ENTER =
  'button, input, select, textarea, summary, [contenteditable], [role="button"]';

/** Whether the focused element handles this key itself. Links only take Enter. */
function ownsKey(target: EventTarget | null, key: string): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest(OWNS_SPACE_AND_ENTER)) return true;
  return key === 'Enter' && target.closest('a[href]') !== null;
}

function isTextField(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** Walking hands the keyboard back to the game: Space must not re-press the last button used. */
function releaseFocusedControl(): void {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && focused !== document.body && !focused.isContentEditable) {
    focused.blur();
  }
}

/**
 * Keyboard input. Returns the held movement keys (physical key → direction),
 * read by the game loop; Space/Enter, "?", + and - fire callbacks. Listeners
 * are removed on unmount, and held keys are released on blur or when disabled.
 */
export function useKeyboardControls({ enabled, onInteract, onHelp, onZoom }: KeyboardControls) {
  const held = useRef(new Map<string, Direction>());
  const handlers = useRef({ onInteract, onHelp, onZoom });
  useLayoutEffect(() => {
    handlers.current = { onInteract, onHelp, onZoom };
  });

  useEffect(() => {
    const keys = held.current;
    if (!enabled) {
      keys.clear();
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isHelpKey(event)) {
        event.preventDefault();
        handlers.current.onHelp();
        return;
      }
      const zoom = zoomFromKey(event);
      if (zoom !== null) {
        if (isTextField(event.target)) return;
        event.preventDefault();
        if (!event.repeat) handlers.current.onZoom(zoom);
        return;
      }
      const direction = directionFromKey(event);
      if (direction) {
        if (isTextField(event.target)) return;
        event.preventDefault();
        releaseFocusedControl();
        keys.set(event.code || event.key.toLowerCase(), direction);
        return;
      }
      if (isInteractKey(event) && !ownsKey(event.target, event.key)) {
        event.preventDefault();
        if (!event.repeat) handlers.current.onInteract();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.code || event.key.toLowerCase());
    };
    const releaseAll = () => {
      keys.clear();
    };
    const onVisibilityChange = () => {
      if (document.hidden) keys.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      keys.clear();
    };
  }, [enabled]);

  return held;
}
