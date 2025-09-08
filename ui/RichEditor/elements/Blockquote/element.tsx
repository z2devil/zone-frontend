import { BlockQuoteElement } from 'types/slate';
import styles from './style.module.scss';

interface BlockQuoteProps {
  attributes: any;
  children: any;
  element: BlockQuoteElement;
}

const BlockQuote = ({ attributes, children }: BlockQuoteProps) => {
  return (
    <blockquote {...attributes} className={styles.blockquote}>
      {children}
    </blockquote>
  );
};

export default BlockQuote;
