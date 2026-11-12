import { render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { content, PLACE_IDS, ui } from '../content';
import { TextVersion } from './TextVersion';

describe('TextVersion', () => {
  it('holds the whole portfolio as headings, lists and links, even when closed', () => {
    render(<TextVersion open={false} onClose={() => undefined} />);
    const article = screen.getByRole('article', { name: content.name });
    expect(
      within(article).getByRole('heading', { level: 1, name: content.name }),
    ).toBeInTheDocument();
    const places = within(article).getAllByRole('heading', { level: 2 });
    expect(places.map((heading) => heading.textContent)).toEqual(
      PLACE_IDS.map((id) => content.places[id].title),
    );
    expect(within(article).getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('keeps hidden links out of the Tab order until it is opened', () => {
    const { rerender } = render(<TextVersion open={false} onClose={() => undefined} />);
    const firstLink = () => screen.getAllByRole('link')[0];
    expect(firstLink()).toHaveAttribute('tabindex', '-1');
    expect(screen.queryByRole('button', { name: ui.textVersion.close })).toBeNull();

    rerender(<TextVersion open onClose={() => undefined} />);
    expect(firstLink()).not.toHaveAttribute('tabindex');
    expect(screen.getByRole('button', { name: ui.textVersion.close })).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveFocus();
  });

  it('gives focus back to its opener when closed', () => {
    const { rerender } = render(<TextVersion open={false} onClose={() => undefined} />);
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    rerender(<TextVersion open onClose={() => undefined} />);
    rerender(<TextVersion open={false} onClose={() => undefined} />);
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('gives focus to its fallback control when opened from nowhere', () => {
    const fallback = createRef<HTMLButtonElement>();
    const page = (open: boolean) => (
      <>
        <button ref={fallback} type="button">
          Version texte
        </button>
        <TextVersion open={open} onClose={() => undefined} returnFocus={fallback} />
      </>
    );
    const { rerender } = render(page(false));
    // Opened from the help dialog, which is already gone: nothing has focus.
    expect(document.body).toHaveFocus();
    rerender(page(true));
    expect(screen.getByRole('article')).toHaveFocus();
    rerender(page(false));
    expect(screen.getByRole('button', { name: 'Version texte' })).toHaveFocus();
  });
});
