import { CollapsibleBlockTitleElement } from 'types/slate';
import { Node } from 'slate';
import { useReadOnly } from 'slate-react';
import styles from './style.module.scss';
import clsx from 'clsx';

interface CollapsibleBlockTitleProps {
  attributes: any;
  children: any;
  element: CollapsibleBlockTitleElement;
}

/**
 * 占位文字用 CSS 伪元素（data-placeholder）渲染，不在可编辑区域插入真实节点：
 * 真实的 contentEditable=false 文本会接住点击后的 DOM 光标，Slate 判定其不可编辑而不同步选区，
 * 导致后续输入写到旧选区所在的段落。
 */
const CollapsibleBlockTitle = ({
  attributes,
  children,
  element,
}: CollapsibleBlockTitleProps) => {
  const readOnly = useReadOnly();
  const showPlaceholder = !readOnly && Node.string(element) === '';

  return (
    <div
      {...attributes}
      className={clsx(styles.collapsibleBlockTitle)}
      data-placeholder={showPlaceholder ? '折叠标题' : undefined}>
      {children}
    </div>
  );
};

export default CollapsibleBlockTitle;
