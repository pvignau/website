import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createBrowserHistory } from './history';
import { Link } from './Link';
import { HistoryContext } from './navigation';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

function renderLink(props: { target?: string } = {}) {
  window.history.replaceState(null, '', '/nowhere');
  render(
    <HistoryContext value={createBrowserHistory(window)}>
      <Link to="/" {...props}>
        Remonter
      </Link>
    </HistoryContext>,
  );
  return screen.getByRole('link', { name: 'Remonter' });
}

describe('Link', () => {
  it('is a real link to the path', () => {
    expect(renderLink()).toHaveAttribute('href', '/');
  });

  it('follows a plain click without reloading the page', () => {
    const link = renderLink();
    // fireEvent returns false when the click's default action (loading the page) was cancelled.
    expect(fireEvent.click(link, { button: 0 })).toBe(false);
    expect(window.location.pathname).toBe('/');
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['middle button', { button: 1 }],
  ])('leaves a %s click to the browser', (_, init) => {
    const link = renderLink();
    expect(fireEvent.click(link, { button: 0, ...init })).toBe(true);
    expect(window.location.pathname).toBe('/nowhere');
  });

  it('leaves a link with a target to the browser', () => {
    const link = renderLink({ target: '_blank' });
    expect(fireEvent.click(link, { button: 0 })).toBe(true);
    expect(window.location.pathname).toBe('/nowhere');
  });
});
