import type { RefObject } from 'react';
import { useLayoutEffect, useState } from 'react';
import type { Size } from '../engine/geometry';

/**
 * Size of an element's box, kept up to date with a ResizeObserver. It is first
 * measured in a layout effect: React re-renders before the browser paints, so
 * the first frame on screen already uses the real size (no layout shift).
 */
export function useElementSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      );
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => {
        window.removeEventListener('resize', update);
      };
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
}
