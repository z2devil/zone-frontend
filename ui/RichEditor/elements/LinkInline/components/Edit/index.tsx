import { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { LinkInlineElement } from 'types/slate';
import { Transforms } from 'slate';
import { throttle } from 'lodash';

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
        <span
          className='absolute bottom-0 left-0 block w-40 -translate-y-full rounded border border-gray-300 bg-gray-50 px-2 py-1'
          contentEditable={false}>
          <input
            className='w-full border-none bg-transparent outline-none'
            defaultValue={url}
            onInput={handleInput}
          />
        </span>
      ) : null}
      <span className='text-black-600 underline'>{children}</span>
    </>
  );
};

export default LinkEdit;
