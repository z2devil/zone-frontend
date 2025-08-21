import { CodeSpanElement } from 'types/slate';
import InlineChromiumBugfix from '../../components/Element/components/InlineChromiumBugfix';

interface CodeSpanProps {
  attributes: any;
  children: any;
  element: CodeSpanElement;
}

const CodeSpan = ({ attributes, children }: CodeSpanProps) => {
  return (
    <code-span {...attributes}>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </code-span>
  );
};

export default CodeSpan;
