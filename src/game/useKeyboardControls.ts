import { useEffect, useLayoutEffect, useRef } from 'react';
import type { Direction } from '../engine/input';
import { directionFromKey, isHelpKey, isInteractKey } from '../engine/input';

interface KeyboardControls {
  /** False while a dialog is open: keys then belong to the page. */
  enabled: boolean;
  onInteract: () => void;
  onHelp: () => void;
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

/** Walking hands the keyboard back to the game: Space must not re-press the last button used. */
function releaseFocusedControl(): void {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && focused !== document.body && !focused.isContentEditable) {
    focused.blur();
  }
}

/**
 * Keyboard input. Returns the held movement keys (physical key → direction),
 * read by the game loop; Space/Enter and "?" fire callbacks. Listeners are
 * removed on unmount, and held keys are released on blur or when disabled.
 */
export function useKeyboardControls({ enabled, onInteract, onHelp }: KeyboardControls) {
  const held = useRef(new Map<string, Direction>());
  const handlers = useRef({ onInteract, onHelp });
  useLayoutEffect(() => {
    handlers.current = { onInteract, onHelp };
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
      const direction = directionFromKey(event);
      if (direction) {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
          return;
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
