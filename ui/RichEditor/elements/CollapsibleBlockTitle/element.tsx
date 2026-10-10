import { CollapsibleBlockTitleElement } from 'types/slate';
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
  return (
    <div {...attributes} className={clsx(styles.collapsibleBlockTitle)}>
      {children}
    </div>
  );
};

export default CollapsibleBlockTitle;
