/** A page with a dog-ear and three lines of text, 8 × 12 pixels drawn 2 × 2. */
export function TextVersionIcon() {
  return (
    <svg
      className="pixel-icon"
      viewBox="0 0 8 12"
      width="16"
      height="24"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path
        fill="currentColor"
        d="M0 0h1v12H0zM1 0h4v1H1zM4 1h2v1H4zM4 2h1v1H4zM6 2h1v1H6zM4 3h4v1H4zM7 4h1v8H7zM1 11h6v1H1zM2 5h4v1H2zM2 7h4v1H2zM2 9h3v1H2z"
      />
    </svg>
  );
}

/** A map pin, 10 × 11 pixels drawn 2 × 2: the button that shows or hides the minimap. */
export function MinimapIcon() {
  return (
    <svg
      className="pixel-icon"
      viewBox="0 0 10 11"
      width="20"
      height="22"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path
        fill="currentColor"
        d="M3 0h4v1H3zM2 1h6v1H2zM1 2h3v1H1zM6 2h3v1H6zM1 3h2v2H1zM7 3h2v2H7zM1 5h3v1H1zM6 5h3v1H6zM2 6h6v2H2zM3 8h4v1H3zM4 9h2v2H4z"
      />
    </svg>
  );
}

/** Plus and minus, 7 × 7 pixels drawn 2 × 2, with the stroke of the other icons. */
export function ZoomIcon({ direction }: { direction: 1 | -1 }) {
  return (
    <svg
      className="pixel-icon"
      viewBox="0 0 7 7"
      width="14"
      height="14"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path
        fill="currentColor"
        d={direction === 1 ? 'M0 3h7v1H0zM3 0h1v3H3zM3 4h1v3H3z' : 'M0 3h7v1H0z'}
      />
    </svg>
  );
}
