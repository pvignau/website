import type { ReactNode } from 'react';
import { Component } from 'react';
import { useCopy } from './copy';
import { PATHS } from './pages';
import { StatusPage } from './StatusPage';

function CrashPage() {
  const { ui } = useCopy();
  return (
    <StatusPage
      documentTitle={ui.pageTitle(ui.error.title)}
      title={ui.error.title}
      body={ui.error.body}
      action={
        // A full page load: after a crash, start again from a clean state.
        <a className="comic-button" href={PATHS.world}>
          {ui.error.backLabel}
        </a>
      }
    />
  );
}

/**
 * Error boundary of the routes: an error while rendering a screen shows the
 * game's error page, never a blank screen. React reports the error itself.
 */
export class RouteError extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? <CrashPage /> : this.props.children;
  }
}
