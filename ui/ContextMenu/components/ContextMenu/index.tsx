'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ContextMenuItem } from '../../hooks/useContextMenu';
import useClickAway from '@/lib/hooks/useClickAway';
import clsx from 'clsx';

interface ContextMenuProps {
  rootRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
  menus: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

const ContextMenu = (props: ContextMenuProps) => {
  const { rootRef, visible, menus, position, onClose } = props;

  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const [style, setStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!visible) {
      return setStyle({
        display: 'none',
      });
    }
    const contextMenuDOM = contextMenuRef.current;
    if (!contextMenuDOM) {
      return setStyle({
        display: 'none',
      });
    }
    const containerDOM = contextMenuDOM.parentElement;
    if (!containerDOM) {
      return setStyle({
        display: 'none',
      });
    }

    setStyle({
      display: 'block',
      left: 0,
      top: 0,
      opacity: 0,
      pointerEvents: 'none',
    });

    requestAnimationFrame(() => {
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

      setStyle({
        display: 'block',
        left: calcX - containerRect.left,
        top: calcY - containerRect.top,
      });
    });
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
    <div className='absolute z-30' ref={contextMenuRef} style={style}>
      <div className='flex flex-col gap-2 divide-y divide-gray-300 rounded-xl bg-white p-4 shadow-main'>
        {stickyMenus.length ? (
          <div
            className={clsx('flex justify-between gap-2', {
              'px-2 pb-2': defaultMenus.length,
            })}>
            {stickyMenus.map(menuItem => (
              <div
                className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-300 text-black-900 transition-colors duration-100 hover:border hover:border-primary-50 hover:bg-primary-50 hover:text-white'
                key={menuItem.key}
                title={menuItem.label}
                onClick={() => handleClick(menuItem)}>
                {menuItem.icon}
              </div>
            ))}
          </div>
        ) : null}
        {defaultMenus.length ? (
          <div
            className={clsx('flex flex-col gap-1', {
              'pt-4': stickyMenus.length,
            })}>
            {defaultMenus.map(menuItem => (
              <div
                className='flex min-w-[9rem] cursor-pointer items-center justify-between rounded-lg py-1 pl-2 pr-1 text-black-600 transition-colors duration-100 hover:bg-black-50 hover:text-black-900'
                key={menuItem.key}
                title={menuItem.label}
                onClick={() => handleClick(menuItem)}>
                <div className='flex items-center'>
                  {menuItem.icon ? (
                    <div className='mr-2'>{menuItem.icon}</div>
                  ) : null}
                  <div>{menuItem.label}</div>
                </div>
                <i className='iconfont icon-angle-right'></i>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ContextMenu;
