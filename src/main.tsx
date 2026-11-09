import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserHistory } from './app/history';
import { legacyHashRoute, normalizeLocation } from './app/location';
import { App } from './app/router';
import './styles/global.css';

// Old links (/#/home, /#/work) become /home and /work before the app reads the address...
normalizeLocation(window.location, window.history);
const history = createBrowserHistory(window);
// ...and when such a hash is typed into the address bar of an open page.
window.addEventListener('hashchange', () => {
  const route = legacyHashRoute(window.location.hash);
  if (route !== null) history.navigate(route, { replace: true });
});

const container = document.getElementById('root');
if (!container) throw new Error('index.html has no #root element.');

// The app runs: the script of index.html no longer shows the text version written in
// the page on an error, and takes it back if an early error (an extension) showed it.
document.documentElement.setAttribute('data-app', '');
document.documentElement.classList.remove('no-game');

createRoot(container).render(
  <StrictMode>
    <App history={history} />
  </StrictMode>,
);
