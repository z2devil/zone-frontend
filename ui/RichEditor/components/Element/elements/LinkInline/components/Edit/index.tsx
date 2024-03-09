import { useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { LinkInlineElement } from 'types/slate';
import { Transforms } from 'slate';

interface LinkPreviewProps {
  children: any;
  element: LinkInlineElement;
  selected?: boolean;
}

const LinkEdit = (props: LinkPreviewProps) => {
  const { children, element, selected } = props;

  const editor = useSlate();

  const url = useMemo(() => element.url, [element.url]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    Transforms.setNodes(
      editor,
      { url },
      { at: ReactEditor.findPath(editor, element) }
    );
  };

  return (
    <>
      {selected ? (
        <span
          className=' absolute bottom-0 left-0 block w-40 -translate-y-full rounded border border-gray-300 bg-gray-50 px-2 py-1'
          contentEditable={false}>
          <input
            defaultValue={url}
            className=' w-full border-none bg-transparent outline-none'
            onInput={handleInput}
          />
        </span>
      ) : null}
      <span className='text-primary-50 underline'>{children}</span>
    </>
  );
};

export default LinkEdit;
