import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useElementSize } from './useElementSize';

function Measured() {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(ref);
  return <div ref={ref} data-testid="box" data-size={`${width}x${height}`} />;
}

describe('useElementSize', () => {
  it('knows the size as soon as the element is rendered, before any paint', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 1280, 720),
    );
    render(<Measured />);
    // No frame went by: a size of 0 x 0 here would be painted, then corrected.
    expect(screen.getByTestId('box')).toHaveAttribute('data-size', '1280x720');
  });

  it('follows later resizes', () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 1280, 720));
    render(<Measured />);
    rect.mockReturnValue(new DOMRect(0, 0, 390, 844));
    // jsdom has no ResizeObserver: the hook then listens to window resizes.
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('box')).toHaveAttribute('data-size', '390x844');
  });
});
