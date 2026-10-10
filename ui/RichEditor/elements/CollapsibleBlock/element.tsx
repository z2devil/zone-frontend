import { ReactEditor, useReadOnly, useSlateStatic } from 'slate-react';
import { CollapsibleBlockElement } from 'types/slate';
import style from './style.module.scss';
import React, { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { editorUtils } from '@/ui/RichEditor/utils/editorUtils';

interface CollapsibleBlockProps {
  attributes: any;
  children: any;
  element: CollapsibleBlockElement;
}

/**
 * 折叠块
 * - element.collapsed 是作者设置的「默认是否折叠」：编辑模式下切换会写回文档
 * - 只读模式下读者的展开/收起只存在本地 state，不写回文档
 * - 内容节点始终渲染，收起时仅隐藏，保证 Slate 能找到对应 DOM
 */
const CollapsibleBlock = ({
  attributes,
  children,
  element,
}: CollapsibleBlockProps) => {
  const readOnly = useReadOnly();
  const editor = useSlateStatic();

  const [readerCollapsed, setReaderCollapsed] = useState(
    element.collapsed ?? false
  );

  const collapsed = readOnly ? readerCollapsed : (element.collapsed ?? false);

  const toggle = useCallback(() => {
    if (readOnly) {
      setReaderCollapsed(value => !value);
      return;
    }
    editorUtils.toggleCollapsibleBlock(
      editor,
      ReactEditor.findPath(editor, element)
    );
  }, [editor, element, readOnly]);

  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    },
    [toggle]
  );

  // 第一个子节点是标题，其余（正常情况下只有内容）放入内容区
  const [titleChild, contentChildren] = useMemo(() => {
    const [first = null, ...rest] = React.Children.toArray(children);
    return [first, rest];
  }, [children]);

  return (
    <div {...attributes} className={clsx(style.collapsibleBlock, 'my-2')}>
      <div
        className={clsx(style.header, { [style.clickable]: readOnly })}
        onClick={readOnly ? toggle : undefined}>
        <button
          aria-expanded={!collapsed}
          aria-label={collapsed ? '展开折叠块' : '收起折叠块'}
          className={clsx(style.toggleButton, {
            [style.collapsed]: collapsed,
          })}
          contentEditable={false}
          type='button'
          onClick={handleButtonClick}>
          <span className='iconfont icon-angle-right'></span>
        </button>
        <div className={style.title}>{titleChild}</div>
      </div>
      <div className={style.content} hidden={collapsed}>
        {contentChildren}
      </div>
    </div>
  );
};

export default CollapsibleBlock;
