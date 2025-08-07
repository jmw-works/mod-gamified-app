import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

export function useHeaderHeight(ref: RefObject<HTMLElement | null>, defaultHeight = 60) {
  const [headerHeight, setHeaderHeight] = useState(defaultHeight);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        setHeaderHeight(ref.current.offsetHeight);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    if (ref.current) {
      observer.observe(ref.current);
    }

    window.addEventListener('resize', updateHeight);
    window.addEventListener('load', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('load', updateHeight);
    };
  }, [ref]);

  return headerHeight;
}



