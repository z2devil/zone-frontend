import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { Element, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { twMerge } from 'tailwind-merge';
import { readNoteDraft, removeNoteDraft } from '@/lib/note-draft';

interface DraftTipProps {
  calssName?: string;
  /**
   * 当前编辑的笔记 id，新建笔记为 `new`
   */
  noteId: string;
}

const DraftTip = (props: DraftTipProps) => {
  const { calssName, noteId } = props;

  const editor = useSlate();

  const [hasDraft, setHasDraft] = useState(false);

  // localStorage 仅在客户端可用
  useEffect(() => {
    setHasDraft(Boolean(readNoteDraft(noteId)));
  }, [noteId]);

  const handleApplyDraft = useCallback(() => {
    const content = readNoteDraft(noteId);
    if (content) {
      Transforms.removeNodes(editor, {
        at: [],
        match: node => Element.isElement(node),
      });
      Transforms.insertNodes(editor, content);
    }
    setHasDraft(false);
  }, [editor, noteId]);

  const handleDiscardDraft = useCallback(() => {
    removeNoteDraft(noteId);
    setHasDraft(false);
  }, [noteId]);

  if (!hasDraft) {
    return null;
  }

  return (
    <div
      className={clsx(
        twMerge(
          'sticky top-0 flex items-center justify-between bg-primary-50 bg-opacity-10 px-6 py-2',
          calssName
        )
      )}>
      <div className='flex-1'>
        <span className='text-sm text-primary-50'>
          有已保存的草稿，是否继续编辑？
        </span>
      </div>
      <div className='flex gap-2'>
        <button
          className='rounded-md border border-primary-50 px-2 py-1 text-xs text-primary-50 hover:bg-black-50'
          onClick={handleApplyDraft}>
          继续编辑
        </button>
        <button
          className='rounded-md border border-primary-50 px-2 py-1 text-xs text-primary-50 hover:bg-black-50'
          onClick={handleDiscardDraft}>
          丢弃草稿
        </button>
      </div>
    </div>
  );
};

export default DraftTip;
