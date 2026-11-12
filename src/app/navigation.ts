import { createContext, use, useSyncExternalStore } from 'react';
import type { AppHistory, AppLocation } from './history';

/** The session history the app moves in; provided by <App>. */
export const HistoryContext = createContext<AppHistory | null>(null);

/** The session history itself, to read the live entry from an event handler. */
export function useHistory(): AppHistory {
  const history = use(HistoryContext);
  if (!history) throw new Error('No history: render inside <App history={...}>.');
  return history;
}

/** The current address and history entry state; re-renders when they change. */
export function useLocation(): AppLocation {
  const history = useHistory();
  return useSyncExternalStore(history.subscribe, history.location, history.location);
}

/** Moves to another path of the site: `navigate('/work?debug', { replace, state })`. */
export function useNavigate(): AppHistory['navigate'] {
  return useHistory().navigate;
}

/** Goes back one entry, like the browser's Back button. */
export function useBack(): AppHistory['back'] {
  return useHistory().back;
}
