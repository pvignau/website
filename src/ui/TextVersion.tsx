import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { content, PLACE_IDS, ui } from '../content';
import { ContentBlocks, LinkList } from './ContentBlocks';
import './TextVersion.css';

export const TEXT_VERSION_ID = 'portfolio';

/** A control that can take focus back: still in the page, and not the page itself. */
function focusable(element: Element | null): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    element !== document.body &&
    element.isConnected &&
    element.closest('[inert]') === null
  );
}

/**
 * The whole portfolio as plain semantic HTML. Always in the DOM, for
 * crawlers and screen readers; visually hidden until opened, then shown
 * full screen over the game (the game is made inert meanwhile).
 *
 * Closing it gives focus back to what had it, or else to `returnFocus`: opened
 * from the help dialog, which closes first, or by a click in Safari, which does
 * not focus buttons, focus would otherwise stay on the hidden article.
 */
export function TextVersion({
  open,
  onClose,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const article = ref.current;
    if (!open || !article) return;
    const opener = document.activeElement;
    // The toolbar button stays in the page while the game is shown.
    const fallback = returnFocus?.current ?? null;
    article.scrollTop = 0;
    article.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    article.addEventListener('keydown', onKeyDown);
    return () => {
      article.removeEventListener('keydown', onKeyDown);
      const target = focusable(opener) ? opener : fallback;
      target?.focus();
    };
  }, [open, onClose, returnFocus]);

  // Hidden, its links stay out of the Tab order: focus never lands on invisible text.
  const linkTabIndex = open ? undefined : -1;

  return (
    <article
      ref={ref}
      id={TEXT_VERSION_ID}
      className={open ? 'text-version text-version--open' : 'text-version'}
      aria-labelledby={`${TEXT_VERSION_ID}-title`}
      tabIndex={-1}
    >
      <div className="text-version__inner">
        <header className="text-version__header">
          <h1 id={`${TEXT_VERSION_ID}-title`}>{content.name}</h1>
          <p className="text-version__role">{content.role}</p>
          <p>{content.pitch}</p>
          {open && (
            <button type="button" className="pixel-button text-version__close" onClick={onClose}>
              {ui.textVersion.close}
            </button>
          )}
        </header>
        {PLACE_IDS.map((id) => {
          const place = content.places[id];
          return (
            <section
              key={id}
              className="text-version__place"
              aria-labelledby={`${TEXT_VERSION_ID}-${id}`}
            >
              <h2 id={`${TEXT_VERSION_ID}-${id}`}>{place.title}</h2>
              <ContentBlocks blocks={place.body} headingLevel={3} linkTabIndex={linkTabIndex} />
              <LinkList links={place.links} linkTabIndex={linkTabIndex} />
            </section>
          );
        })}
      </div>
    </article>
  );
}
