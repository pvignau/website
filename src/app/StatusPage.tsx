import type { ReactNode } from 'react';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import './StatusPage.css';

/** Full-page message in the game's style: the hero bobbing in the sea, a panel, a way back. */
export function StatusPage({
  documentTitle,
  title,
  body,
  action,
}: {
  documentTitle: string;
  title: string;
  body: string;
  action: ReactNode;
}) {
  useDocumentTitle(documentTitle);
  return (
    <main className="status-page">
      <div className="status-page__splash" aria-hidden="true">
        <span className="status-page__hero" />
      </div>
      <div className="status-page__panel panel">
        <h1 className="status-page__title">{title}</h1>
        <p className="status-page__body">{body}</p>
        {action}
      </div>
    </main>
  );
}
