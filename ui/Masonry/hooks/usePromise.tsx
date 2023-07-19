import { useCallback, useState } from 'react';

const usePromise = () => {
  const [promise, setPromise] = useState<Promise<unknown>>();
  const [resolveFn, setResolveFn] = useState<(value: unknown) => void>();
  const [rejectFn, setRejectFn] = useState<() => void>();

  const reset = useCallback(() => {
    setPromise(
      new Promise((resolve, reject) => {
        setResolveFn(() => resolve);
        setRejectFn(() => reject);
      })
    );
  }, []);

  return [promise, resolveFn, rejectFn, reset] as const;
};

export default usePromise;
