import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { STATIC_PAGES } from './src/app/pages.ts';
import { content, PLACE_IDS, ui } from './src/content/index.ts';
import { sitePages } from './vite-plugins/site-pages.ts';
import { renderStaticPage } from './vite-plugins/static-page.ts';
import { tiledMap } from './vite-plugins/tiled-map.ts';

/** GitHub Pages serves the site on the domain written in public/CNAME. */
const origin = `https://${readFileSync(new URL('public/CNAME', import.meta.url), 'utf8').trim()}`;

// https://vite.dev/config/
export default defineConfig({
  // Canonical URLs written by the app when it changes page (src/app/usePageMeta.ts).
  define: { __SITE_ORIGIN__: JSON.stringify(origin) },
  build: {
    // The hero sprites weigh under 1 kB each, but inlined they would be copied in the
    // render-blocking stylesheet and in the script: they stay separate files.
    assetsInlineLimit: (file) => (file.includes('/src/img/hero/') ? false : undefined),
  },
  plugins: [
    react(),
    tiledMap(),
    sitePages({
      origin,
      locale: 'fr_FR',
      siteName: ui.siteName,
      image: { path: '/og-image.png', width: 1200, height: 630, alt: ui.ogImageAlt },
      loading: ui.loading,
      staticPage: renderStaticPage(content, PLACE_IDS, ui.noscript),
      pages: STATIC_PAGES,
      fallback: { file: '404.html', title: ui.pageTitle(content.notFound.title) },
    }),
  ],
  test: {
    restoreMocks: true,
    unstubGlobals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'app',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
          // Other stylesheets stay empty in tests; this one is read as text by focus-ring.test.ts.
          css: { include: [/src\/styles\/global\.css/] },
        },
      },
      {
        extends: true,
        test: {
          name: 'build',
          environment: 'node',
          include: ['vite-plugins/**/*.test.ts', 'tools/**/*.test.ts'],
        },
      },
    ],
  },
});
