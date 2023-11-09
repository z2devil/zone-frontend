import { RefObject, useCallback, useEffect } from 'react';

const useClickAway = (
  callback: (event: MouseEvent) => void,
  target: RefObject<HTMLElement>
) => {
  const handleClickAway = useCallback(
    (event: MouseEvent) => {
      if (target.current && !target.current.contains(event.target as Node)) {
        callback(event);
      }
    },
    [callback, target]
  );

  useEffect(() => {
    document.addEventListener('click', handleClickAway);
    return () => {
      document.removeEventListener('click', handleClickAway);
    };
  });
};

export default useClickAway;
