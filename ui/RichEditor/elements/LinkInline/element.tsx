import { useReadOnly, useSelected } from 'slate-react';
import { LinkInlineElement } from 'types/slate';
import LinkEdit from './components/Edit';
import LinkPreview from './components/Preview';
import InlineChromiumBugfix from '../../components/Element/components/InlineChromiumBugfix';

interface LinkInlineProps {
  attributes: any;
  children: any;
  element: LinkInlineElement;
}

const LinkInline = ({ attributes, children, element }: LinkInlineProps) => {
  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <span {...attributes} className='relative'>
      {!readOnly ? (
        <LinkEdit element={element} selected={selected}>
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </LinkEdit>
      ) : (
        <LinkPreview element={element}>
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </LinkPreview>
      )}
    </span>
  );
};

export default LinkInline;
