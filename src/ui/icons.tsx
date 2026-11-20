/*
 * Icons inked like the rest of the comic: round strokes in the colour of the
 * text (.icon in global.css), on a 24 × 24 grid.
 */

/** A page with a dog-ear and three lines of text: the text version. */
export function TextVersionIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M5.5 2.5h8.5l4.5 4.5v14.5h-13z" />
      <path d="M14 2.5V7h4.5M9 12h6M9 15.5h6M9 19h3.5" />
    </svg>
  );
}

/** A map pin: the button that shows or hides the minimap. */
export function MinimapIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M12 21.5S5.5 15.2 5.5 9.8a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11.7-6.5 11.7z" />
      <circle cx="12" cy="9.8" r="2.3" />
    </svg>
  );
}

/** Plus and minus, with the stroke of the other icons. */
export function ZoomIcon({ direction }: { direction: 1 | -1 }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d={direction === 1 ? 'M5 12h14M12 5v14' : 'M5 12h14'} strokeWidth="3" />
    </svg>
  );
}

/** A cross: the button that closes a dialog. */
export function CloseIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeWidth="3" />
    </svg>
  );
}
