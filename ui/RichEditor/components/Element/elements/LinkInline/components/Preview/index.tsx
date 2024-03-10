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
      href={url}
      className='text-primary-50 underline'
      target='_blank'
      rel='noreferrer'>
      {children}
    </a>
  );
};

export default LinkPreview;
