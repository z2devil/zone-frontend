import { useMemo } from 'react';
import { useSlate } from 'slate-react';
import { LinkInlineElement } from 'types/slate';
import styles from '../../style.module.scss';
import { getSafeLinkHref } from '../../safeUrl';

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

  const url = useMemo(() => getSafeLinkHref(element.url), [element.url]);

  if (isSummary || !url) {
    return <span className={styles.linkPreview}>{children}</span>;
  }

  return (
    <a
      className={styles.linkPreview}
      href={url}
      rel='noreferrer'
      target='_blank'>
      {children}
    </a>
  );
};

export default LinkPreview;
