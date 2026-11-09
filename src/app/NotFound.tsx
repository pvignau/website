import { content, ui } from '../content';
import { Link } from './Link';
import { PATHS } from './pages';
import { StatusPage } from './StatusPage';
import { usePageMeta } from './usePageMeta';

export function NotFound() {
  const { notFound } = content;
  // Not a page to index: no canonical URL.
  usePageMeta(null);
  return (
    <StatusPage
      documentTitle={ui.pageTitle(notFound.title)}
      title={notFound.title}
      body={notFound.body}
      action={
        <Link className="pixel-button" to={PATHS.world}>
          {notFound.backLabel}
        </Link>
      }
    />
  );
}
