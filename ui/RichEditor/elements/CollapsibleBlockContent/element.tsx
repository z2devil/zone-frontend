import { CollapsibleBlockContentElement } from 'types/slate';
import styles from './style.module.scss';
import clsx from 'clsx';

interface CollapsibleBlockContentProps {
  attributes: any;
  children: any;
  element: CollapsibleBlockContentElement;
}

const CollapsibleBlockContent = ({
  attributes,
  children,
  element,
}: CollapsibleBlockContentProps) => {
  return (
    <div {...attributes} className={clsx(styles.collapsibleBlockContent)}>
      {children}
    </div>
  );
};

export default CollapsibleBlockContent;
