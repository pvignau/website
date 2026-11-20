import { createContext, use } from 'react';
import type { Copy } from '../content';
import { COPIES, DEFAULT_LANG } from '../content';

/**
 * The copy of the page's language, provided by <App>. A page keeps its language:
 * the switch to the other one loads that language's own page.
 */
export const CopyContext = createContext<Copy>(COPIES[DEFAULT_LANG]);

/** What the visitor reads, in the language of the page: `{ lang, content, ui }`. */
export function useCopy(): Copy {
  return use(CopyContext);
}
