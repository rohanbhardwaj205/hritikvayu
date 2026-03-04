"use client";

import { useState, useEffect, type RefObject } from "react";

/**
 * Observes whether the element referenced by `ref` is intersecting
 * the viewport (or a specified root). Useful for lazy loading,
 * infinite scroll, and scroll-triggered animations.
 */
export function useIntersection(
  ref: RefObject<Element | null>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}
