'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ContextMenuItem } from '../../hooks/useContextMenu';
import useClickAway from '@/lib/hooks/useClickAway';

interface ContextMenuProps {
  rootRef: React.RefObject<HTMLElement>;
  visible: boolean;
  menus: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

const ContextMenu = (props: ContextMenuProps) => {
  const { rootRef, visible, menus, position, onClose } = props;

  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const calcStyle = useMemo(() => {
    if (!visible) {
      return {
        display: 'none',
      };
    }
    const contextMenuDOM = contextMenuRef.current;
    if (!contextMenuDOM) {
      return {
        display: 'none',
      };
    }
    const containerDOM = contextMenuDOM.parentElement;
    if (!containerDOM) {
      return {
        display: 'none',
      };
    }
    const rootDOM = rootRef.current;
    const rootRect = rootDOM
      ? rootDOM.getBoundingClientRect()
      : {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        };
    const contextMenuRect = contextMenuDOM.getBoundingClientRect();
    const containerRect = containerDOM.getBoundingClientRect();

    const calcX =
      position.x + contextMenuRect.width > rootRect.x + rootRect.width
        ? position.x - contextMenuRect.width
        : position.x;
    const calcY =
      position.y + contextMenuRect.height > rootRect.y + rootRect.height
        ? position.y - contextMenuRect.height
        : position.y;

    return {
      display: 'block',
      left: calcX - containerRect.left,
      top: calcY - containerRect.top,
    };
  }, [rootRef, visible, position]);

  const handleClick = (menuItem: ContextMenuItem) => {
    menuItem?.onClick();
    onClose();
  };

  useClickAway(onClose, contextMenuRef);

  return (
    <div ref={contextMenuRef} className='absolute z-30' style={calcStyle}>
      <div className='rounded bg-white shadow'>
        {menus.map(menuItem => (
          <div
            key={menuItem.key}
            className='flex cursor-pointer items-center px-4 py-2 text-gray-600 hover:bg-gray-100'
            onClick={() => handleClick(menuItem)}>
            {menuItem.icon && (
              <div className='mr-2 text-xl text-gray-400'>{menuItem.icon}</div>
            )}
            <div>{menuItem.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu;
