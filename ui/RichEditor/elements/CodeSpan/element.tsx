import { CodeSpanElement } from 'types/slate';
import InlineChromiumBugfix from '../../components/InlineChromiumBugfix';
import styles from './style.module.scss';

interface CodeSpanProps {
  attributes: any;
  children: any;
  element: CodeSpanElement;
}

const CodeSpan = ({ attributes, children }: CodeSpanProps) => {
  return (
    <code-span {...attributes} className={styles.codeSpan}>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </code-span>
  );
};

export default CodeSpan;
