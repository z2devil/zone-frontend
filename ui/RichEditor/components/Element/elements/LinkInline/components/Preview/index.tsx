import { useMemo } from 'react';
import { useSlate } from 'slate-react';
import { LinkInlineElement } from 'types/slate';

interface LinkPreviewProps {
  children: any;
  element: LinkInlineElement;
}

const LinkPreview = (props: LinkPreviewProps) => {
  const { children, element } = props;

  const editor = useSlate();

  const isSummary = useMemo(() => {
    return editor.isSummary;
  }, [editor.isSummary]);

  const url = useMemo(() => element.url, [element.url]);

  if (isSummary) {
    return <span className='text-primary-50 underline'>{children}</span>;
  }

  return (
    <a
      className='text-primary-50 underline'
      href={url}
      rel='noreferrer'
      target='_blank'>
      {children}
    </a>
  );
};

export default LinkPreview;
