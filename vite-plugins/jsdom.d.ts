/// <reference lib="dom" />

/** jsdom ships no types: this is the part the build tests use. */
declare module 'jsdom' {
  export class JSDOM {
    /** Scripting stays disabled unless asked: <noscript> is parsed as markup. */
    constructor(html: string);
    readonly window: Window;
  }
}
