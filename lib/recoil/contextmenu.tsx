'use client';

import useContextMenu, {
  ContextMenuUtils,
} from '@/ui/ContextMenu/hooks/useContextMenu';
import { useEffect } from 'react';
import { atom, useSetRecoilState } from 'recoil';

export const contextMenuUtilsState = atom<ContextMenuUtils | null>({
  key: 'contextMenuUtilsState',
  default: null,
});

const ContextMenuUtilsProvider = () => {
  const [contextMenuUtils, contextMenuHolder] = useContextMenu();

  const setContextMenuStore = useSetRecoilState(contextMenuUtilsState);

  useEffect(() => {
    setContextMenuStore(contextMenuUtils);
  }, [contextMenuUtils, setContextMenuStore]);

  return <>{contextMenuHolder}</>;
};

export default ContextMenuUtilsProvider;
