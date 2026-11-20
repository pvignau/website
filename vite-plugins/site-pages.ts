import type { Plugin } from 'vite';

export interface SitePage {
  /** Output file, e.g. `home.html`, `en/home.html`; the first page must be `index.html`. */
  file: string;
  path: string;
  /** Key of its language in `SiteMetadata.languages`. */
  language: string;
  title: string;
  description: string;
  /**
   * The same page in every language, its own included (`hreflang` links). The
   * language of the first page is the default (`x-default`).
   */
  alternates?: readonly { language: string; path: string }[];
  /**
   * Images the page shows first, as source paths (`src/maps/world.webp`). The
   * script only asks for them once it runs: preloaded, they download alongside it.
   */
  preload?: readonly string[];
}

/** What a page says in its language, beyond its own title and description. */
export interface SiteLanguage {
  /** `lang` of the page, e.g. `fr`. */
  lang: string;
  /** Open Graph locale, e.g. `fr_FR`. */
  locale: string;
  siteName: string;
  /** Alternative text of the Open Graph image. */
  imageAlt: string;
  /** Label of the boot loader, shown before the app starts. */
  loading: string;
  /**
   * The whole portfolio as plain HTML (see static-page.ts), written in every page
   * after the loader: shown without JavaScript, or when the game cannot start.
   */
  staticPage: string;
}

export interface SiteMetadata {
  /** Canonical origin, e.g. `https://pyve.is-a.dev`. */
  origin: string;
  image: { path: string; width: number; height: number };
  languages: Readonly<Record<string, SiteLanguage>>;
  pages: readonly SitePage[];
  /**
   * Copy of the app served for unknown paths (GitHub Pages: 404.html), with the
   * title of the 404 page and its language (the app then follows the address);
   * not to be indexed.
   */
  fallback: { file: string; title: string; language: string };
  /**
   * Who the site is about: a schema.org `ProfilePage` in each indexed page, and a
   * `rel="me"` link to each of their profiles (`sameAs`).
   */
  person?: {
    name: string;
    alternateName: string;
    jobTitle: string;
    worksFor: string;
    sameAs: readonly string[];
  };
}

const META_START = '<!-- site-meta -->';
const META_END = '<!-- /site-meta -->';
const STATIC_START = '<!-- site-static -->';
const STATIC_END = '<!-- /site-static -->';
const LOADER_LABEL = /<span class="loader__label">[^<]*<\/span>/;
const HTML_LANG = /<html lang="[^"]*">/;

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

/** JSON in a <script>: `<` escaped, so no text can close the element. */
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

/** The schema.org data of an indexed page: a profile page, about its person. */
export function structuredData(site: SiteMetadata, page: SitePage): string | null {
  const { person } = site;
  if (!person) return null;
  // The person's own page is the home page in the language of this one.
  const home = site.pages.find((candidate) => candidate.language === page.language);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: new URL(page.path, site.origin).href,
    name: page.title,
    inLanguage: languageNamed(site, page.language).lang,
    mainEntity: {
      '@type': 'Person',
      name: person.name,
      alternateName: person.alternateName,
      jobTitle: person.jobTitle,
      worksFor: { '@type': 'Organization', name: person.worksFor },
      url: new URL(home?.path ?? '/', site.origin).href,
      image: new URL(site.image.path, site.origin).href,
      sameAs: person.sameAs,
    },
  };
  return `<script type="application/ld+json">${scriptJson(data)}</script>`;
}

const meta = (key: 'name' | 'property', name: string, value: string) =>
  `<meta ${key}="${name}" content="${escapeHtml(value)}" />`;

function languageNamed(site: SiteMetadata, key: string): SiteLanguage {
  const language = site.languages[key];
  if (!language) throw new Error(`site-pages: no language "${key}".`);
  return language;
}

/** The language of a page; `null` is the fallback page. */
export function languageOf(site: SiteMetadata, page: SitePage | null): SiteLanguage {
  return languageNamed(site, page?.language ?? site.fallback.language);
}

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
  const language = languageOf(site, page);
  // The fallback page describes the site as the home page does.
  const title = page?.title ?? site.fallback.title;
  const description = (page ?? home).description;
  const url = page ? new URL(page.path, site.origin).href : null;
  const href = (path: string) => escapeHtml(new URL(path, site.origin).href);
  const alternates = page?.alternates ?? [];
  const byDefault = alternates.find((alternate) => alternate.language === home.language);
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    meta('name', 'description', description),
    // /404.html itself answers with a 200: no soft 404 in search results.
    page === null && meta('name', 'robots', 'noindex'),
    url && `<link rel="canonical" href="${escapeHtml(url)}" />`,
    ...alternates.map(
      (alternate) =>
        `<link rel="alternate" hreflang="${escapeHtml(languageNamed(site, alternate.language).lang)}" href="${href(alternate.path)}" />`,
    ),
    byDefault && `<link rel="alternate" hreflang="x-default" href="${href(byDefault.path)}" />`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', language.siteName),
    meta('property', 'og:locale', language.locale),
    ...alternates
      .filter((alternate) => alternate.language !== page?.language)
      .map((alternate) =>
        meta('property', 'og:locale:alternate', languageNamed(site, alternate.language).locale),
      ),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    url && meta('property', 'og:url', url),
    meta('property', 'og:image', new URL(site.image.path, site.origin).href),
    meta('property', 'og:image:width', String(site.image.width)),
    meta('property', 'og:image:height', String(site.image.height)),
    meta('property', 'og:image:alt', language.imageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
    ...(page ? (site.person?.sameAs ?? []) : []).map(
      (profile) => `<link rel="me" href="${escapeHtml(profile)}" />`,
    ),
    page && structuredData(site, page),
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

function replaceOnce(html: string, marker: string | RegExp, replacement: string): string {
  const found = typeof marker === 'string' ? html.includes(marker) : marker.test(html);
  if (!found) throw new Error(`site-pages: index.html lacks ${String(marker)}.`);
  return html.replace(marker, () => replacement);
}

const staticPattern = new RegExp(`${STATIC_START}[\\s\\S]*?${STATIC_END}`);

/**
 * Writes what a page says in its language: `lang`, loader label and text version.
 * The text version keeps its markers, so that each page of the build swaps it.
 */
function localize(html: string, language: SiteLanguage, marker: string | RegExp): string {
  let result = replaceOnce(html, HTML_LANG, `<html lang="${escapeHtml(language.lang)}">`);
  result = replaceOnce(result, marker, `${STATIC_START}${language.staticPage}${STATIC_END}`);
  return replaceOnce(
    result,
    LOADER_LABEL,
    `<span class="loader__label">${escapeHtml(language.loading)}</span>`,
  );
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
        const home = site.pages[0] ?? null;
        const result = replaceOnce(html, META_START, metaBlock(site, home));
        return localize(result, languageOf(site, home), STATIC_START);
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
        const page = (target: SitePage | null) =>
          localize(
            html.replace(blockPattern, () => metaBlock(site, target, preloads(target))),
            languageOf(site, target),
            staticPattern,
          );
        index.source = page(home ?? null);
        const variants: { fileName: string; page: SitePage | null }[] = [
          // GitHub Pages serves home.html for /home and home/index.html for /home/: with
          // both, a shared link with a trailing slash gets the page, not a 404.
          ...others.flatMap((other) => [
            { fileName: other.file, page: other },
            { fileName: other.file.replace(/\.html$/, '/index.html'), page: other },
          ]),
          { fileName: site.fallback.file, page: null },
        ];
        for (const variant of variants) {
          this.emitFile({ type: 'asset', fileName: variant.fileName, source: page(variant.page) });
        }
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(site) });
        // Derived from the origin (public/CNAME), like the sitemap it points to.
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots(site) });
      },
    },
  };
  return [pages, noscriptStyle];
}
