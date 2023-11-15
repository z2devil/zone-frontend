import { useEffect, useState } from 'react';
import { UseBoundStore } from 'zustand';

const usePersistStoreHydration = (useStore: UseBoundStore<any>) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useStore.persist.onHydrate(() => setHydrated(false));

    const unsubFinishHydration = useStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );

    setHydrated(useStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, [useStore.persist]);

  return hydrated;
};

export default usePersistStoreHydration;
