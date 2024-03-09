import { useMemo } from 'react';
import { LinkInlineElement } from 'types/slate';

interface LinkPreviewProps {
  children: any;
  element: LinkInlineElement;
}

const LinkPreview = (props: LinkPreviewProps) => {
  const { children, element } = props;

  const url = useMemo(() => element.url, [element.url]);

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
