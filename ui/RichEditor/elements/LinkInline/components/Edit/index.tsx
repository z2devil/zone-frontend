import { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { LinkInlineElement } from 'types/slate';
import { Transforms } from 'slate';
import { throttle } from 'lodash';
import styles from '../../style.module.scss';

interface LinkPreviewProps {
  children: any;
  element: LinkInlineElement;
  selected?: boolean;
}

const LinkEdit = (props: LinkPreviewProps) => {
  const { children, element, selected } = props;

  const editor = useSlate();

  const url = useMemo(() => element.url, [element.url]);

  const throttledUpdateUrl = useRef(
    throttle((e: ChangeEvent<HTMLInputElement>) => {
      Transforms.setNodes(
        editor,
        { url: e.target.value.trim() },
        { at: ReactEditor.findPath(editor, element) }
      );
    }, 100)
  );

  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    throttledUpdateUrl.current(event);
  }, []);

  useEffect(() => throttledUpdateUrl.current.cancel, []);

  return (
    <>
      {selected ? (
        <span className={styles.linkInputContainer} contentEditable={false}>
          <input
            className={styles.linkInput}
            defaultValue={url}
            onInput={handleInput}
          />
        </span>
      ) : null}
      <span className={styles.linkEdit}>{children}</span>
    </>
  );
};

export default LinkEdit;
