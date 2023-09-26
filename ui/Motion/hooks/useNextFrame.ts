import { useCallback } from 'react';

const useNextFrame = (): [(callback: () => void, delay?: number) => void] => {
  const nextFrame = useCallback((callback: () => void, delay = 2) => {
    requestAnimationFrame(() => {
      if (delay <= 1) {
        callback();
      } else {
        nextFrame(callback, delay - 1);
      }
    });
  }, []);
  return [nextFrame];
};

export default useNextFrame;
