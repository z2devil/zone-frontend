import { useCallback, useMemo, useRef } from 'react';
import { useLoadingStore } from '../stores';
import { useUnmount } from 'react-use';

interface UseLoadingOptions {
  unique: boolean;
  delay: number;
  timeout: number;
}

export const useLoading = (
  key: string,
  options?: Partial<UseLoadingOptions>
) => {
  const { unique = false, delay = 400, timeout = 400 } = options || {};

  const loadingStore = useLoadingStore();

  const parsedKey = useMemo(() => (unique ? Symbol(key) : key), [key, unique]);

  const isLoading = useMemo(
    () => loadingStore.loadingMap[parsedKey],
    [loadingStore.loadingMap, parsedKey]
  );

  const isUiLoading = useMemo(
    () => loadingStore.uiLoadingMap[parsedKey],
    [loadingStore.uiLoadingMap, parsedKey]
  );

  const delayTimer = useRef<NodeJS.Timeout | null>(null);

  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  const startTime = useRef<number | null>(null);

  const setLoading = useCallback(
    (value: boolean) => {
      loadingStore.setLoadingMap(parsedKey, value);

      if (value) {
        delayTimer.current = setTimeout(() => {
          loadingStore.setUiLoadingMap(parsedKey, true);
          startTime.current = Date.now();
        }, delay);
      } else {
        if (delayTimer.current) {
          clearTimeout(delayTimer.current);
          delayTimer.current = null;
        }

        if (startTime.current) {
          const elapsed = Date.now() - startTime.current;

          if (elapsed < timeout) {
            timeoutTimer.current = setTimeout(() => {
              loadingStore.setUiLoadingMap(parsedKey, false);
            }, timeout - elapsed);
          } else {
            loadingStore.setUiLoadingMap(parsedKey, false);
          }
        } else {
          loadingStore.setUiLoadingMap(parsedKey, false);
        }
      }
    },
    [delay, loadingStore, parsedKey, timeout]
  );

  useUnmount(() => {
    loadingStore.setLoadingMap(parsedKey, false);
    loadingStore.setUiLoadingMap(parsedKey, false);
    if (delayTimer.current) clearTimeout(delayTimer.current);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
  });

  return {
    isLoading,
    isUiLoading,
    setLoading,
  };
};
