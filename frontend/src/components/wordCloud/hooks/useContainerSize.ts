import { useEffect, useRef, useState } from 'react';
import { ContainerSize } from '../types';
import { WORD_CLOUD_CONFIG } from '../constants';

/**
 * Custom hook for managing container size with ResizeObserver
 */
export const useContainerSize = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<ContainerSize>({
    width: WORD_CLOUD_CONFIG.DEFAULT_WIDTH,
    height: WORD_CLOUD_CONFIG.DEFAULT_HEIGHT
  });

  useEffect(() => {
    if (!wrapperRef.current) return;

    const element = wrapperRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({
          width: Math.max(WORD_CLOUD_CONFIG.MIN_WIDTH, width),
          height: Math.max(WORD_CLOUD_CONFIG.MIN_HEIGHT, height)
        });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { wrapperRef, containerSize };
};
