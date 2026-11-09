import type { Plugin } from 'vite';

export interface SitePage {
  /** Output file, e.g. `home.html`; the first page must be `index.html`. */
  file: string;
  path: string;
  title: string;
  description: string;
  /**
   * Images the page shows first, as source paths (`src/maps/world.webp`). The
   * script only asks for them once it runs: preloaded, they download alongside it.
   */
  preload?: readonly string[];
}

export interface SiteMetadata {
  /** Canonical origin, e.g. `https://pyve.is-a.dev`. */
  origin: string;
  /** Open Graph locale, e.g. `fr_FR`. */
  locale: string;
  siteName: string;
  image: { path: string; width: number; height: number; alt: string };
  /** Label of the boot loader, shown before the app starts. */
  loading: string;
  /**
   * The whole portfolio as plain HTML (see static-page.ts), written in every page
   * after the loader: shown without JavaScript, or when the game cannot start.
   */
  staticPage: string;
  pages: readonly SitePage[];
  /**
   * Copy of the app served for unknown paths (GitHub Pages: 404.html), with the
   * title of the 404 page; not to be indexed.
   */
  fallback: { file: string; title: string };
}

const META_START = '<!-- site-meta -->';
const META_END = '<!-- /site-meta -->';
const STATIC_PAGE = '<!-- site-static -->';
const LOADER_LABEL = '<span class="loader__label"></span>';

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

const meta = (key: 'name' | 'property', name: string, value: string) =>
  `<meta ${key}="${name}" content="${escapeHtml(value)}" />`;

/**
 * <head> metadata of one page; `null` is the fallback page, which has no canonical
 * URL. `preloads` are the built URLs of the page's images, known once bundled.
 */
export function metaBlock(
  site: SiteMetadata,
  page: SitePage | null,
  preloads: readonly string[] = [],
): string {
  const home = site.pages[0];
  if (!home) throw new Error('site-pages: no page configured.');
  // The fallback page describes the site as the home page does.
  const title = page?.title ?? site.fallback.title;
  const description = (page ?? home).description;
  const url = page ? new URL(page.path, site.origin).href : null;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    meta('name', 'description', description),
    // /404.html itself answers with a 200: no soft 404 in search results.
    page === null && meta('name', 'robots', 'noindex'),
    url && `<link rel="canonical" href="${escapeHtml(url)}" />`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', site.siteName),
    meta('property', 'og:locale', site.locale),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    url && meta('property', 'og:url', url),
    meta('property', 'og:image', new URL(site.image.path, site.origin).href),
    meta('property', 'og:image:width', String(site.image.width)),
    meta('property', 'og:image:height', String(site.image.height)),
    meta('property', 'og:image:alt', site.image.alt),
    meta('name', 'twitter:card', 'summary_large_image'),
    ...preloads.map((href) => `<link rel="preload" href="${escapeHtml(href)}" as="image" />`),
  ];
  return [META_START, ...tags.filter(Boolean), META_END].join('\n    ');
}

/**
 * Without JavaScript, the text version replaces the loader and the page scrolls. These
 * rules must beat the bundled stylesheet (boot.css shows the loader and hides the text
 * version, global.css locks the scroll): they come after it, at the end of <head>, and
 * are !important anyway.
 */
export const NOSCRIPT_STYLE =
  'html #loader{display:none!important}html .static-page{display:block!important}html body{overflow:auto!important}';

export function sitemap(site: SiteMetadata): string {
  const urls = site.pages
    .map((page) => `  <url><loc>${escapeHtml(new URL(page.path, site.origin).href)}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Lets every crawler in, and points it to the sitemap of the same origin. */
export function robots(site: SiteMetadata): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.origin).href}\n`;
}

function replaceOnce(html: string, marker: string, replacement: string): string {
  if (!html.includes(marker)) throw new Error(`site-pages: index.html lacks ${marker}.`);
  return html.replace(marker, () => replacement);
}

/** Fills index.html from the site content (dev and build); copies it per route at build time. */
export function sitePages(site: SiteMetadata): Plugin[] {
  const blockPattern = new RegExp(`${META_START}[\\s\\S]*?${META_END}`);
  const noscriptStyle: Plugin = {
    name: 'pyve:site-pages:noscript-style',
    // After Vite's own transforms: the bundled stylesheet is already in <head>.
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        { tag: 'noscript', injectTo: 'head', children: `<style>${NOSCRIPT_STYLE}</style>` },
      ],
    },
  };
  const pages: Plugin = {
    name: 'pyve:site-pages',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = replaceOnce(html, META_START, metaBlock(site, site.pages[0] ?? null));
        result = replaceOnce(result, STATIC_PAGE, site.staticPage);
        return replaceOnce(
          result,
          LOADER_LABEL,
          LOADER_LABEL.replace('><', `>${escapeHtml(site.loading)}<`),
        );
      },
    },
    generateBundle: {
      // After Vite's own HTML plugin has emitted dist/index.html.
      order: 'post',
      handler(_, bundle) {
        const index = bundle['index.html'];
        if (index?.type !== 'asset' || typeof index.source !== 'string') {
          throw new Error('site-pages: dist/index.html was not generated.');
        }
        const html = index.source;
        if (!blockPattern.test(html)) throw new Error('site-pages: metadata block not found.');

        // Built name of each source file: src/maps/world.webp -> assets/world-<hash>.webp.
        const built = new Map<string, string>();
        for (const file of Object.values(bundle)) {
          if (file.type === 'asset')
            for (const name of file.originalFileNames) built.set(name, file.fileName);
        }
        const preloads = (page: SitePage | null) =>
          (page?.preload ?? []).map((source) => {
            const fileName = built.get(source);
            if (fileName === undefined)
              throw new Error(`site-pages: ${source} is not in the build.`);
            return `/${fileName}`;
          });

        const [home, ...others] = site.pages;
        index.source = html.replace(blockPattern, () =>
          metaBlock(site, home ?? null, preloads(home ?? null)),
        );
        const variants: { fileName: string; page: SitePage | null }[] = [
          // GitHub Pages serves home.html for /home and home/index.html for /home/: with
          // both, a shared link with a trailing slash gets the page, not a 404.
          ...others.flatMap((page) => [
            { fileName: page.file, page },
            { fileName: page.file.replace(/\.html$/, '/index.html'), page },
          ]),
          { fileName: site.fallback.file, page: null },
        ];
        for (const { fileName, page } of variants) {
          this.emitFile({
            type: 'asset',
            fileName,
            source: html.replace(blockPattern, () => metaBlock(site, page, preloads(page))),
          });
        }
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(site) });
        // Derived from the origin (public/CNAME), like the sitemap it points to.
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots(site) });
      },
    },
  };
  return [pages, noscriptStyle];
}
