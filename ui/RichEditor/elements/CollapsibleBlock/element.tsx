import { useReadOnly, useSlate } from 'slate-react';
import { CollapsibleBlockElement } from 'types/slate';
import style from './style.module.scss';
import { useCallback, useMemo } from 'react';
import React from 'react';
import clsx from 'clsx';
import { ReactEditor } from 'slate-react';
import { Transforms } from 'slate';

interface CollapsibleBlockProps {
  attributes: any;
  children: any;
  element: CollapsibleBlockElement;
}

const CollapsibleBlock = ({
  attributes,
  children,
  element,
}: CollapsibleBlockProps) => {
  const readOnly = useReadOnly();
  const editor = useSlate();

  const collapsed = element.collapsed ?? false;

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (readOnly) return;

      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(editor, { collapsed: !collapsed }, { at: path });
    },
    [editor, element, collapsed, readOnly]
  );

  // 分离标题和内容子元素
  // children 是 ReactNode，按照子元素的顺序排列
  const [titleChild, contentChild] = useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    return [childrenArray[0] || null, childrenArray[1] || null];
  }, [children]);

  return (
    <div {...attributes} className={clsx(style.collapsibleBlock, 'my-2')}>
      <div className={style.header} onClick={handleToggle}>
        <button
          aria-label={collapsed ? '展开' : '收起'}
          className={clsx(style.toggleButton, {
            [style.collapsed]: collapsed,
          })}
          contentEditable={false}
          type='button'>
          <span className='iconfont icon-angle-right'></span>
        </button>
        <div className={style.title}>{titleChild}</div>
      </div>
      {!collapsed && contentChild && (
        <div className={style.content}>{contentChild}</div>
      )}
    </div>
  );
};

export default CollapsibleBlock;
