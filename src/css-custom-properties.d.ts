import 'react';

declare module 'react' {
  /** Allows CSS custom properties (`--s`, `--frame`…) in style props. */
  // Declaration merging needs an interface, so no Record here.
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
