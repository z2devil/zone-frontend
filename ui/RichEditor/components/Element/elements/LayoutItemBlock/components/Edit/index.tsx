import { useCallback, useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { LayoutBlockElement } from 'types/slate';
import { Transforms } from 'slate';

interface LayoutEditProps {
  element: LayoutBlockElement;
}

const LayoutEdit = (props: LayoutEditProps) => {
  const { element } = props;

  const editor = useSlate();

  const url = useMemo(() => element.url, [element.url]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      Transforms.setNodes(
        editor,
        { url },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  return (
    <>
      <div className='flex w-full flex-col gap-4'>
        <input defaultValue={url} onInput={handleInput}></input>
        <iframe className='aspect-video h-full w-full' src={url}></iframe>
      </div>
    </>
  );
};

export default LayoutEdit;
