import { RefCallback, useEffect, useState } from 'react';

type UseIntersectionObserverOptions = IntersectionObserverInit & {
  freezeOnceVisible?: boolean;
};

export const useIntersectionObserver = <T extends Element = HTMLElement>(
  options: UseIntersectionObserverOptions = {},
) => {
  const { freezeOnceVisible = false, ...observerOptions } = options;
  const [node, setNode] = useState<T | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const isIntersecting = Boolean(entry?.isIntersecting);
  const frozen = freezeOnceVisible && isIntersecting;

  useEffect(() => {
    if (!node || frozen) {
      return;
    }

    const observer = new IntersectionObserver(([nextEntry]) => {
      setEntry(nextEntry);
    }, observerOptions);

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, frozen, observerOptions.root, observerOptions.rootMargin, observerOptions.threshold]);

  const ref: RefCallback<T> = (nextNode) => {
    setNode(nextNode);
  };

  return {
    ref,
    entry,
    isIntersecting,
  };
};

