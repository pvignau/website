import type { Lang } from '../content';
import { DEFAULT_LANG } from '../content';
import { localizedPath, splitLanguage } from './language';

/** The part of the address the app reads, plus what it stored with the history entry. */
export interface AppLocation {
  /** The path the app routes on, without the language prefix: `/home` for /en/home. */
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
  /** `history.state`: set by the app when it creates the entry (arrival door, open dialog). */
  readonly state: unknown;
}

export interface NavigateOptions {
  /** Replaces the current entry instead of adding one (Back then skips it). */
  readonly replace?: boolean;
  readonly state?: unknown;
}

/**
 * Session history for the app: three static routes need no more than this.
 * `location()` and `subscribe()` fit useSyncExternalStore; the browser's own
 * moves (Back, Forward, a hash typed in the address bar) arrive as popstate.
 */
export interface AppHistory {
  location: () => AppLocation;
  subscribe: (listener: () => void) => () => void;
  /** Goes to a path of the site (`/work?debug`), adding an entry unless `replace`. */
  navigate: (to: string, options?: NavigateOptions) => void;
  /** The address of a path of the site, in the language of the page: `/en/work`. */
  href: (to: string) => string;
  back: () => void;
}

/**
 * The history of a page in one language: the app reads and writes paths without
 * the prefix of its language (/en), which this history takes off and puts back.
 */
export function createBrowserHistory(window: Window, lang: Lang = DEFAULT_LANG): AppHistory {
  const read = (): AppLocation => {
    const { search, hash } = window.location;
    const { path } = splitLanguage(window.location.pathname);
    return { pathname: path, search, hash, state: window.history.state as unknown };
  };
  const href = (to: string) => localizedPath(lang, to);
  let current = read();
  const listeners = new Set<() => void>();
  /** Reads the address again; the snapshot only changes (and re-renders) when it moved. */
  const refresh = () => {
    const next = read();
    const moved =
      next.pathname !== current.pathname ||
      next.search !== current.search ||
      next.hash !== current.hash ||
      next.state !== current.state;
    if (moved) current = next;
    return moved;
  };
  const update = () => {
    if (refresh()) for (const listener of listeners) listener();
  };

  return {
    location: () => current,
    subscribe(listener) {
      if (listeners.size === 0) {
        // Unwatched until now: the address may have moved meanwhile.
        refresh();
        window.addEventListener('popstate', update);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('popstate', update);
      };
    },
    navigate(to, { replace = false, state = null } = {}) {
      if (replace) window.history.replaceState(state, '', href(to));
      else window.history.pushState(state, '', href(to));
      update();
    },
    href,
    back() {
      window.history.back();
    },
  };
}
