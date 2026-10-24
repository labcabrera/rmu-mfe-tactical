import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Width in px of the element the returned callback ref is attached to, kept up to date with a ResizeObserver;
 * `null` until it is measured.
 */
export const useElementWidth = <T extends HTMLElement>(): [(element: T | null) => void, number | null] => {
  const [width, setWidth] = useState<number | null>(null);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((element: T | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!element || typeof ResizeObserver === 'undefined') return;
    // Whole pixels: sub-pixel changes would re-render the board for nothing.
    observer.current = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.current.observe(element);
  }, []);

  useEffect(() => () => observer.current?.disconnect(), []);

  return [ref, width];
};
