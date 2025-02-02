import { useCallback, useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { TipBlockElement } from 'types/slate';
import { Transforms } from 'slate';
import data from '@emoji-mart/data';
import EmojiPicker from '@emoji-mart/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';

interface TipEditProps {
  element: TipBlockElement;
  children?: any;
}

const TipEdit = (props: TipEditProps) => {
  const { element, children } = props;

  const editor = useSlate();

  const icon = useMemo(() => element.icon, [element.icon]);

  const handleEmojiSelect = useCallback(
    (emoji: any) => {
      Transforms.setNodes(
        editor,
        { icon: emoji.native },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className='flex h-7 w-7 cursor-pointer items-center justify-center'
            contentEditable={false}>
            <span className='text-xl'>{icon ?? '😀'}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent className='border-none shadow-none'>
            <EmojiPicker
              data={data}
              locale='zh'
              onEmojiSelect={handleEmojiSelect}
            />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <div className='w-full'>{children}</div>
    </>
  );
};

export default TipEdit;
