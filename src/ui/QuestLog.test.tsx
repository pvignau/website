import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ui } from '../content';
import { QuestLog } from './QuestLog';

describe('QuestLog', () => {
  it('shows the progress as 2/4 and reads it as "2 sur 4"', () => {
    const { container } = render(<QuestLog visited={['home', 'lab']} initiallyOpen={false} />);
    const summary = container.querySelector('summary');
    expect(summary).toHaveTextContent(ui.quest.progress(2, 4));
    // The accessible text of the summary skips the shown fraction.
    const read = [...(summary?.querySelectorAll(':scope span:not([aria-hidden])') ?? [])]
      .map((span) => span.textContent)
      .join(' ');
    expect(read).toContain(ui.quest.progressLabel(2, 4));
    expect(screen.getByText(ui.quest.progress(2, 4))).toHaveAttribute('aria-hidden', 'true');
  });
});
