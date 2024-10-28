import { useCallback, useState } from 'react';
import { Element, Transforms } from 'slate';
import { useSlate } from 'slate-react';

const DraftTip = () => {
  const editor = useSlate();

  const [hideDraftTip, setHideDraftTip] = useState(false);

  const handleApplyDraft = useCallback(() => {
    const draft = localStorage.getItem('note-draft');
    if (draft) {
      if (editor) {
        Transforms.removeNodes(editor, {
          at: [],
          match: node => Element.isElement(node),
        });
        Transforms.insertNodes(editor, JSON.parse(draft));
      }
    }
    setHideDraftTip(true);
  }, [editor]);

  const handleCloseDraftTip = useCallback(() => {
    localStorage.removeItem('note-draft');
    setHideDraftTip(true);
  }, []);

  if (hideDraftTip) {
    return null;
  }

  return (
    <div className='flex items-center justify-between bg-primary-50 bg-opacity-10 px-6 py-2'>
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
          onClick={handleCloseDraftTip}>
          不再提醒
        </button>
      </div>
    </div>
  );
};

export default DraftTip;
