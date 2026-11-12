/// <reference types="vite/client" />

/** Tiled map reduced by vite-plugins/tiled-map.ts; validate it with parseTiledMap(). */
declare module '*.json?tiled' {
  const map: unknown;
  export default map;
}

/** Origin of the site (from public/CNAME), e.g. `https://pyve.is-a.dev`; see vite.config.ts. */
declare const __SITE_ORIGIN__: string;
