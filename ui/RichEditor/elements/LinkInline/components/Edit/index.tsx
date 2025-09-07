import { LinkInlineElement } from 'types/slate';
import styles from '../../style.module.scss';

interface LinkEditProps {
  children: any;
  element: LinkInlineElement;
  selected?: boolean;
}

const LinkEdit = (props: LinkEditProps) => {
  const { children } = props;

  return <span className={styles.linkEdit}>{children}</span>;
};

export default LinkEdit;
