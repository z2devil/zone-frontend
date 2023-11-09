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

  const stickyMenus = useMemo(() => {
    return menus.filter(menu => menu.sticky);
  }, [menus]);

  const defaultMenus = useMemo(() => {
    return menus.filter(menu => !menu.sticky);
  }, [menus]);

  const handleClick = (menuItem: ContextMenuItem) => {
    menuItem?.onClick();
    onClose();
  };

  useClickAway(onClose, contextMenuRef);

  return (
    <div ref={contextMenuRef} className='absolute z-30' style={calcStyle}>
      <div className=' flex min-w-[12rem] flex-col gap-2 rounded-xl bg-gray-100 p-4 shadow-main'>
        <div className=' mx-2 mb-2 flex justify-between'>
          {stickyMenus.map(menuItem => (
            <div
              key={menuItem.key}
              className=' flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-300 text-black-900 transition-colors duration-100 hover:border hover:border-primary-50 hover:bg-primary-50 hover:text-white'
              title={menuItem.label}
              onClick={() => handleClick(menuItem)}>
              {menuItem.icon}
            </div>
          ))}
        </div>
        {stickyMenus.length ? (
          <div className=' h-[1px] w-full bg-gray-300'></div>
        ) : null}
        <div className=' flex flex-col gap-1'>
          {defaultMenus.map(menuItem => (
            <div
              key={menuItem.key}
              className=' flex cursor-pointer items-center justify-between rounded-lg border border-transparent py-2 pl-2 pr-1 text-black-600 transition-colors duration-100 hover:border hover:border-primary-50 hover:bg-black-50 hover:text-black-900'
              title={menuItem.label}
              onClick={() => handleClick(menuItem)}>
              <div className=' flex items-center'>
                {menuItem.icon ? (
                  <div className='mr-2 text-xl text-gray-400'>
                    {menuItem.icon}
                  </div>
                ) : null}
                <div>{menuItem.label}</div>
              </div>
              <i className=' iconfont icon-angle-right'></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
