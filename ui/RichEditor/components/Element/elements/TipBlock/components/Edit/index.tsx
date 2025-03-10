import { useCallback, useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { TipBlockElement } from 'types/slate';
import { Transforms } from 'slate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';
import EmojiPicker from '@/ui/EmojiPicker';
import { ScrollArea } from '@/ui/components/ui/scroll-area';

interface TipEditProps {
  element: TipBlockElement;
  children?: any;
}

const TipEdit = (props: TipEditProps) => {
  const { element, children } = props;

  const editor = useSlate();

  const icon = useMemo(() => element.icon, [element.icon]);

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      Transforms.setNodes(
        editor,
        { icon: emoji },
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
          <DropdownMenuContent className='py-4'>
            <ScrollArea className='h-[400px] w-96'>
              <EmojiPicker className='w-96 px-3' onClick={handleEmojiSelect} />
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <div className='w-full'>{children}</div>
    </>
  );
};

export default TipEdit;
