import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Place } from '../content';
import { ui } from '../content';
import { BACKDROP_GRACE_MS } from './Dialog';
import { PlaceDialog } from './PlaceDialog';

const place: Place = {
  id: 'work',
  label: 'Projets',
  zone: 'Atelier',
  title: 'Quelques projets',
  quest: 'Lire le panneau',
  body: [
    { kind: 'paragraph', text: 'Un <b>panneau</b> couvert d’affiches.' },
    { kind: 'list', items: ['Premier', 'Second'] },
    {
      kind: 'projects',
      items: [
        {
          name: 'Daily Drive',
          summary: 'Une playlist reconstruite chaque matin.',
          tags: ['TypeScript', 'Next.js'],
          links: [{ label: 'Le code', href: 'https://example.com/daily-drive' }],
        },
      ],
    },
  ],
  links: [
    { label: 'Tous mes dépôts', href: 'https://example.com/repos' },
    { label: 'E-mail', href: 'mailto:hello@example.com' },
  ],
};

describe('PlaceDialog', () => {
  it('is a modal dialog named by its title', () => {
    render(<PlaceDialog place={place} onClose={() => undefined} />);
    const dialog = screen.getByRole('dialog', { name: 'Quelques projets' });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByText('Atelier')).toBeInTheDocument();
  });

  it('renders the content blocks as semantic HTML, never as markup', () => {
    render(<PlaceDialog place={place} onClose={() => undefined} />);
    const dialog = screen.getByRole('dialog');
    // The paragraph text is shown as-is: no <b> element is created.
    expect(within(dialog).getByText('Un <b>panneau</b> couvert d’affiches.')).toBeInTheDocument();
    expect(dialog.querySelector('b')).toBeNull();
    expect(within(dialog).getByText('Premier').tagName).toBe('LI');
    expect(
      within(dialog).getByRole('heading', { level: 3, name: 'Daily Drive' }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('TypeScript').tagName).toBe('LI');
  });

  it('opens external links in a new tab, safely, and says so', () => {
    render(<PlaceDialog place={place} onClose={() => undefined} />);
    // Accessible-name engines differ on the space before a hidden suffix.
    const newTab = ui.dialog.newTab.replace(/[()]/g, '\\$&');
    const code = screen.getByRole('link', { name: new RegExp(`^Le code\\s*${newTab}$`) });
    expect(code).toHaveAttribute('href', 'https://example.com/daily-drive');
    expect(code).toHaveAttribute('target', '_blank');
    expect(code).toHaveAttribute('rel', 'noopener noreferrer');
    const mail = screen.getByRole('link', { name: 'E-mail' });
    expect(mail).not.toHaveAttribute('target');
  });

  it('starts on its content, a region the keyboard can scroll', () => {
    render(<PlaceDialog place={place} onClose={() => undefined} />);
    const content = screen.getByRole('region', { name: 'Quelques projets' });
    expect(content).toHaveFocus();
    expect(content).toHaveAttribute('tabindex', '0');
    expect(content).toHaveTextContent('Un <b>panneau</b>');
  });

  it('ignores Space and Enter held down since before it opened', () => {
    render(<PlaceDialog place={place} onClose={() => undefined} />);
    const close = screen.getByRole('button', { name: ui.dialog.close });
    for (const key of [' ', 'Enter']) {
      // fireEvent returns false when the default action (pressing the button) was cancelled.
      expect(fireEvent.keyDown(close, { key, repeat: true }), `repeated ${key}`).toBe(false);
      expect(fireEvent.keyDown(close, { key }), `fresh ${key}`).toBe(true);
    }
    expect(fireEvent.keyDown(close, { key: 'ArrowDown', repeat: true })).toBe(true);
  });

  it('keeps Tab and Shift+Tab inside the dialog', async () => {
    const user = userEvent.setup();
    render(<PlaceDialog place={place} onClose={() => undefined} />);
    const dialog = screen.getByRole('dialog');
    const close = within(dialog).getByRole('button', { name: ui.dialog.close });
    const lastLink = within(dialog).getByRole('link', { name: 'E-mail' });

    lastLink.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(lastLink).toHaveFocus();
  });

  describe('backdrop', () => {
    function openDialog() {
      const now = vi.spyOn(performance, 'now').mockReturnValue(1000);
      const onClose = vi.fn();
      render(<PlaceDialog place={place} onClose={onClose} />);
      const dialog = screen.getByRole('dialog');
      return { dialog, onClose, at: (ms: number) => now.mockReturnValue(1000 + ms) };
    }

    it('closes on a press that starts and ends on it', () => {
      const { dialog, onClose, at } = openDialog();
      at(BACKDROP_GRACE_MS + 1);
      fireEvent.pointerDown(dialog);
      fireEvent.click(dialog);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('stays open when a press in the text ends on it (selecting, scrolling)', () => {
      const { dialog, onClose, at } = openDialog();
      at(BACKDROP_GRACE_MS + 1);
      fireEvent.pointerDown(screen.getByText('Premier'));
      // The browser sends the click to the common ancestor: the dialog itself.
      fireEvent.click(dialog);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('ignores the end of the tap that opened it, and a quick second tap', () => {
      const { dialog, onClose, at } = openDialog();
      // The tap on A opened the dialog on pointerdown; its click lands on the backdrop.
      fireEvent.click(dialog);
      at(200);
      fireEvent.pointerDown(dialog);
      fireEvent.click(dialog);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('closes with the close button or Escape, and gives focus back', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Ouvrir
          </button>
          {open && (
            <PlaceDialog
              place={place}
              onClose={() => {
                onClose();
                setOpen(false);
              }}
            />
          )}
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Ouvrir' });

    await user.click(opener);
    await user.click(screen.getByRole('button', { name: ui.dialog.close }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();

    await user.click(opener);
    // jsdom has no native Escape handling: fire the event the browser sends.
    screen.getByRole('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    await vi.waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    expect(opener).toHaveFocus();
  });
});
