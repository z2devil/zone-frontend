import { useReadOnly, useSelected } from 'slate-react';
import { LinkInlineElement } from 'types/slate';
import LinkEdit from './components/Edit';
import LinkPreview from './components/Preview';

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
          {children}
        </LinkEdit>
      ) : (
        <LinkPreview element={element}>{children}</LinkPreview>
      )}
    </span>
  );
};

export default LinkInline;
