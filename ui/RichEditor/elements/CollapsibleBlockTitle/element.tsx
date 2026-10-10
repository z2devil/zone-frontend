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

const CollapsibleBlockTitle = ({
  attributes,
  children,
  element,
}: CollapsibleBlockTitleProps) => {
  const readOnly = useReadOnly();
  const showPlaceholder = !readOnly && Node.string(element) === '';

  return (
    <div {...attributes} className={clsx(styles.collapsibleBlockTitle)}>
      {showPlaceholder ? (
        <span className={styles.placeholder} contentEditable={false}>
          折叠标题
        </span>
      ) : null}
      {children}
    </div>
  );
};

export default CollapsibleBlockTitle;
