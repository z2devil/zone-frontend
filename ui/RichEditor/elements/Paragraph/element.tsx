import { ParagraphElement } from 'types/slate';
import styles from './style.module.scss';

interface ParagraphProps {
  attributes: any;
  children: any;
  element: ParagraphElement;
}

const Paragraph = ({ attributes, children }: ParagraphProps) => {
  return (
    <p {...attributes} className={styles.paragraph}>
      {children}
    </p>
  );
};

export default Paragraph;
