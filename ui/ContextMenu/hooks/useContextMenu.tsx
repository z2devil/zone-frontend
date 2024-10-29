import { useMemo, useRef, useState } from 'react';
import ContextMenu from '../components/ContextMenu';

export interface ContextMenuItem {
  key: string;
  label: string;
  onClick: () => void;
  icon?: string | React.ReactNode;
  disabled?: boolean;
  sticky?: boolean;
}

export interface ContextMenuUtils {
  open: (
    menus: (ContextMenuItem | false | undefined)[],
    position: { x: number; y: number },
    root?: HTMLElement
  ) => void;
  close: () => void;
}

const useContextMenu = () => {
  const rootRef = useRef<HTMLElement | null>(null);

  const [visible, setVisible] = useState(false);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [menus, setMenus] = useState<ContextMenuItem[]>([]);

  const open: ContextMenuUtils['open'] = (menus, position, root) => {
    const nextMenus = menus.filter(Boolean) as ContextMenuItem[];
    if (!nextMenus.length) return;
    setVisible(true);
    setPosition(position);
    setMenus(nextMenus);
    if (root) {
      rootRef.current = root;
    }
  };

  const close: ContextMenuUtils['close'] = () => {
    setVisible(false);
  };

  const utils: ContextMenuUtils = useMemo(() => {
    return {
      open,
      close,
    };
  }, []);

  const contextHolder = (
    <ContextMenu
      menus={menus}
      position={position}
      rootRef={rootRef}
      visible={visible}
      onClose={close}
    />
  );

  return [utils, contextHolder] as const;
};

export default useContextMenu;
