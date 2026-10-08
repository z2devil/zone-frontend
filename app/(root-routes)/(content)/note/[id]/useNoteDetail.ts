import {
  AdjacentNotes,
  NoteInfo,
  deleteNoteAPI,
  getAdjacentNotesAPI,
  getNoteAPI,
} from '@/lib/api/notes';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import { useCallback, useEffect, useState } from 'react';

/**
 * unavailable 同时覆盖不存在、无权访问和请求失败，
 * 不向 UI 区分具体原因，避免泄露私密笔记是否存在。
 */
export type NoteDetailStatus = 'loading' | 'ready' | 'unavailable';

const EMPTY_ADJACENT: AdjacentNotes = { prev: null, next: null };

/**
 * 详情页普通路由与拦截路由共用的数据加载逻辑
 */
export const useNoteDetail = (id: string, cachedNote?: NoteInfo) => {
  const [request] = useRequest();

  const [status, setStatus] = useState<NoteDetailStatus>('loading');

  const [note, setNote] = useState<NoteInfo | null>(cachedNote ?? null);

  const [adjacentNotes, setAdjacentNotes] =
    useState<AdjacentNotes>(EMPTY_ADJACENT);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus('loading');
      setAdjacentNotes(EMPTY_ADJACENT);
      try {
        const res = await getNoteAPI(request)(id);
        if (cancelled) return;
        setNote(res);
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        setNote(null);
        setStatus('unavailable');
        return;
      }
      try {
        const adjacent = await getAdjacentNotesAPI(request)(id);
        if (!cancelled) setAdjacentNotes(adjacent);
      } catch (error) {
        // 相邻笔记失败不影响正文阅读
        console.error(error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id, request]);

  /**
   * 删除成功后才从跨页面 store 中移除；失败时抛出，store 保持不变
   */
  const deleteNote = useCallback(async () => {
    await deleteNoteAPI(request)(id);
    useNotesStore.getState().removeNote(id);
  }, [id, request]);

  return { status, note, adjacentNotes, deleteNote };
};
