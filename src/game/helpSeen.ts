import { getLocalStorage, readStorage, writeStorage } from '../lib/storage';

/** Set once the help screen has been closed: it then only opens on demand. */
export const HELP_SEEN_KEY = 'pyve:help-seen:v1';

const storage = getLocalStorage();
/** Without storage (blocked cookies), the help still shows once per visit, not at every door. */
let seenThisVisit = false;

export const helpSeen = {
  get: (): boolean => seenThisVisit || readStorage(storage, HELP_SEEN_KEY) !== null,
  mark: (): void => {
    seenThisVisit = true;
    writeStorage(storage, HELP_SEEN_KEY, '1');
  },
  /** A first visit again (tests). */
  reset: (): void => {
    seenThisVisit = false;
    writeStorage(storage, HELP_SEEN_KEY, null);
  },
};
