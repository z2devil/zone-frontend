import { useCallback, useState } from 'react';
import { Descendant } from 'slate';
import { useMount } from 'react-use';
import { getNoteAPI } from '@/lib/api/notes';
import useRequest from '@/lib/hooks/useRequest';
import { BlockElementType } from '@/lib/constants';
import { parseNoteContent } from '@/lib/note-content/parse';
import type { NoteOptions } from '@/ui/NotePublish';

export const NEW_NOTE_ID = 'new';

export type NoteLoadStatus = 'loading' | 'ready' | 'error';

interface NoteLoadState {
  status: NoteLoadStatus;
  content: Descendant[];
  options: NoteOptions;
}

const createEmptyState = (status: NoteLoadStatus): NoteLoadState => ({
  status,
  content: [
    {
      type: BlockElementType.PARAGRAPH,
      children: [{ text: '' }],
    },
  ],
  options: {
    title: '',
    bannerPath: '',
    tags: [],
    visibility: 'public',
  },
});

/**
 * 加载待编辑笔记。
 * 只有 status 为 ready 时才允许渲染编辑器，加载或解析失败统一进入 error，
 * 避免以空白内容覆盖原笔记。
 */
export const useNoteLoader = (id: string) => {
  const isCreate = id === NEW_NOTE_ID;

  const [request] = useRequest();

  const [state, setState] = useState<NoteLoadState>(() =>
    createEmptyState(isCreate ? 'ready' : 'loading')
  );

  const load = useCallback(async () => {
    if (isCreate) return;
    setState(createEmptyState('loading'));
    try {
      const res = await getNoteAPI(request)(id);
      const content = parseNoteContent(res.content);
      if (!content) throw new Error('Invalid note content');
      setState({
        status: 'ready',
        content,
        options: {
          title: res.title,
          bannerPath: res.bannerPath,
          tags: res.tags.map(tag => tag._id),
          visibility: res.visibility,
        },
      });
    } catch {
      setState(createEmptyState('error'));
    }
  }, [id, isCreate, request]);

  useMount(() => {
    load();
  });

  return { ...state, isCreate, retry: load };
};
