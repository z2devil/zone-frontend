import { IRequest } from '@/lib/hooks/useRequest';
import { IPageData } from '../types';
import {
  AdjacentNotes,
  GetNotesParams,
  NoteInfo,
  PostNoteParams,
  PutNoteParams,
} from './types';

const normalizeNote = (note: NoteInfo | null | undefined): NoteInfo => {
  if (!note) throw new Error('笔记不存在');
  return {
    ...note,
    // 历史数据缺少该字段时按公开处理；未知值则保守地按私密处理。
    visibility:
      note.visibility === undefined
        ? 'public'
        : note.visibility === 'public'
          ? 'public'
          : 'private',
  };
};

/**
 * 获取 note
 */
export const getNoteAPI = (request: IRequest) => async (id: string) => {
  return normalizeNote(await request.get<NoteInfo>(`/note/${id}`));
};

/**
 * 获取 note 列表
 */
export const getNotesAPI =
  (request: IRequest) => async (params: GetNotesParams) => {
    const data = await request.get<IPageData<NoteInfo>>('/note', params);
    return { ...data, list: data.list.map(normalizeNote) };
  };

/**
 * 获取相邻 note
 */
export const getAdjacentNotesAPI =
  (request: IRequest) => async (id: string) => {
    const data = await request.get<AdjacentNotes>(`/note/adjacent/${id}`);
    return {
      prev: data.prev ? normalizeNote(data.prev) : null,
      next: data.next ? normalizeNote(data.next) : null,
    };
  };

/**
 * 创建 note
 */
export const postNoteAPI =
  (request: IRequest) => async (params: PostNoteParams) => {
    const note = await request.post<NoteInfo>('/note', {
      body: JSON.stringify(params),
    });
    return normalizeNote(note);
  };

/**
 * 删除 note
 */
export const deleteNoteAPI = (request: IRequest) => async (id: string) => {
  return await request.delete('/note', {
    body: JSON.stringify({
      _id: id,
    }),
  });
};

/**
 * 更新 note
 */
export const putNoteAPI =
  (request: IRequest) => async (params: PutNoteParams) => {
    const note = await request.put<NoteInfo>('/note', {
      body: JSON.stringify(params),
    });
    return normalizeNote(note);
  };
