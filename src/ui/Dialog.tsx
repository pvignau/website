import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { ui } from '../content';
import './Dialog.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * A key held down repeats. When the key that opened the dialog is still held
 * (Space or Enter on a place), its repeats must not press a control of the
 * dialog, nor scroll it: only a fresh press counts.
 */
function ignoreHeldKeys(event: KeyboardEvent<HTMLDialogElement>): void {
  if (event.repeat && (event.key === ' ' || event.key === 'Enter')) event.preventDefault();
}

/**
 * A press on the backdrop this soon after opening is not a request to close: the
 * tap on A that opened the dialog, or the second tap of a double tap, lands there.
 */
export const BACKDROP_GRACE_MS = 500;

/** Tab from the last control goes back to the first one, and Shift+Tab the other way round. */
function wrapFocus(event: KeyboardEvent<HTMLDialogElement>): void {
  if (event.key !== 'Tab') return;
  const focusables = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const first = focusables[0];
  const last = focusables.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Small line above the title (the zone of a place, for instance). */
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Modal built on the native <dialog>: showModal() makes the rest of the page
 * inert, and Tab cycles through the dialog's controls. Escape, the close
 * button and a click on the backdrop all call `onClose`; focus then returns
 * to where it was.
 *
 * Focus starts on the content, a scrollable region: arrows and Page Down
 * scroll it, screen readers read it from the top, and a key still held from
 * the game lands on no button.
 *
 * Only a press that starts and ends on the backdrop closes it: a drag from the
 * text (to select it, or to grab the scrollbar) that ends outside does not.
 */
export function Dialog({ open, onClose, title, eyebrow, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const openedAt = useRef(0);
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    openedAt.current = performance.now();
    bodyRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  return (
    // The backdrop click is a mouse shortcut; Escape and the close button cover keyboards.
    // eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={(event) => {
        // Closed by the browser itself (some Escape paths skip the cancel event). The event
        // is async: ignore it if the dialog was reopened meanwhile (StrictMode remounts).
        if (!event.currentTarget.open) onClose();
      }}
      onPointerDown={(event) => {
        pressedBackdrop.current =
          event.target === event.currentTarget &&
          performance.now() - openedAt.current >= BACKDROP_GRACE_MS;
      }}
      onClick={(event) => {
        const onBackdrop = pressedBackdrop.current && event.target === event.currentTarget;
        pressedBackdrop.current = false;
        if (onBackdrop) onClose();
      }}
      onKeyDownCapture={ignoreHeldKeys}
      onKeyDown={wrapFocus}
    >
      <div className="dialog__frame panel">
        <header className="dialog__header">
          <div>
            {eyebrow && <p className="dialog__eyebrow">{eyebrow}</p>}
            <h2 id={titleId} className="dialog__title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="dialog__close pixel-button pixel-button--quiet"
            aria-label={ui.dialog.close}
            onClick={onClose}
          >
            <svg
              viewBox="0 0 7 7"
              width="14"
              height="14"
              aria-hidden="true"
              shapeRendering="crispEdges"
            >
              <path
                fill="currentColor"
                d="M0 0h1v1H0zm1 1h1v1H1zm1 1h1v1H2zm1 1h1v1H3zm1-1h1v1H4zm1-1h1v1H5zm1-1h1v1H6zM2 4h1v1H2zM1 5h1v1H1zM0 6h1v1H0zm4-2h1v1H4zm1 1h1v1H5zm1 1h1v1H6z"
              />
            </svg>
          </button>
        </header>
        <div
          ref={bodyRef}
          className="dialog__body"
          role="region"
          aria-labelledby={titleId}
          // Scrollable with the keyboard; also where focus starts.
          // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex
          tabIndex={0}
        >
          {children}
        </div>
        {footer && <footer className="dialog__footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
