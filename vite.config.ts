import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { localizedPath } from './src/app/language.ts';
import { PATHS, STATIC_PAGES, translationsOf } from './src/app/pages.ts';
import type { Lang } from './src/content/index.ts';
import { COPIES, DEFAULT_LANG, LANGS, LANGUAGES, PLACE_IDS } from './src/content/index.ts';
import type { SiteLanguage } from './vite-plugins/site-pages.ts';
import { sitePages } from './vite-plugins/site-pages.ts';
import { renderStaticPage } from './vite-plugins/static-page.ts';
import { tiledMap } from './vite-plugins/tiled-map.ts';

/** GitHub Pages serves the site on the domain written in public/CNAME. */
const origin = `https://${readFileSync(new URL('public/CNAME', import.meta.url), 'utf8').trim()}`;

/** What the pages of a language say around their own title: see SiteLanguage. */
function siteLanguage(lang: Lang): SiteLanguage {
  const { content, ui } = COPIES[lang];
  const others = LANGS.filter((other) => other !== lang).map((other) => ({
    lang: other,
    name: LANGUAGES[other].name,
    href: localizedPath(other, PATHS.world),
  }));
  return {
    lang,
    locale: LANGUAGES[lang].locale,
    siteName: ui.siteName,
    imageAlt: ui.ogImageAlt,
    loading: ui.loading,
    staticPage: renderStaticPage(content, PLACE_IDS, ui.noscript, others),
  };
}

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
      image: { path: '/og-image.png', width: 1200, height: 630 },
      languages: Object.fromEntries(LANGS.map((lang) => [lang, siteLanguage(lang)])),
      pages: STATIC_PAGES.map((page) => ({
        ...page,
        language: page.lang,
        alternates: translationsOf(page).map(({ lang, path }) => ({ language: lang, path })),
      })),
      // Shared by every language: the app writes the title of its own 404 page.
      fallback: {
        file: '404.html',
        title: COPIES[DEFAULT_LANG].ui.pageTitle(COPIES[DEFAULT_LANG].content.notFound.title),
        language: DEFAULT_LANG,
      },
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
