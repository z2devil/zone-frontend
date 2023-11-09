import { Key, useMemo, useRef, useState } from 'react';
import ContextMenu from '../components/ContextMenu';

export interface ContextMenuItem {
  key: Key;
  label: string;
  onClick: () => void;
  icon?: string | React.ReactNode;
  disabled?: boolean;
  sticky?: boolean;
}

export interface ContextMenuUtils {
  open: (
    menus: ContextMenuItem[],
    position: { x: number; y: number },
    root?: HTMLElement
  ) => void;
  close: () => void;
}

const useContextMenu = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [menus, setMenus] = useState<ContextMenuItem[]>([]);

  const open = (
    menus: ContextMenuItem[],
    position: { x: number; y: number },
    root?: HTMLDivElement | null
  ) => {
    setVisible(true);
    setPosition(position);
    setMenus(menus);
    if (root) {
      rootRef.current = root;
    }
  };

  const close = () => {
    setVisible(false);
  };

  const utils = useMemo(() => {
    return {
      open,
      close,
    };
  }, []);

  const contextHolder = (
    <ContextMenu
      rootRef={rootRef}
      visible={visible}
      menus={menus}
      position={position}
      onClose={close}
    />
  );

  return [utils, contextHolder] as const;
};

export default useContextMenu;
