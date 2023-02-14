
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import reportWebVitals from './reportWebVitals';

const App = React.lazy(() => import('./App'));
const Home = React.lazy(() => import('./Home'));

import {
  createHashRouter,
  RouterProvider
} from "react-router-dom";

import { store } from './store'
import { Provider } from 'react-redux'

declare global { // FIXME : move this
  interface Window { 
    debug: boolean; 
  }
}
window.debug = (window.location.hostname === 'localhost');

const router = createHashRouter([
  {
    path: "/",
    element: <React.Suspense fallback={<>...</>}>
      <App />
    </React.Suspense>
  },
  {
    path: "/home",
    element: <React.Suspense fallback={<>...</>}>
      <Home />
    </React.Suspense>
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
