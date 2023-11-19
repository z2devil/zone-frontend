import { IRequest } from '@/lib/hooks/useRequest';
import { IPageData } from '../types';
import {
  GetNotesParams,
  NoteInfo,
  PostNoteParams,
  PutNoteParams,
} from './types';
import { cache } from 'react';

/**
 * 获取 note
 */
export const getNoteAPI = (request: IRequest) => async (id: string) => {
  return await request.get<NoteInfo>(`/note/${id}`);
};

/**
 * 获取 note 列表
 */
export const getNotesAPI = (request: IRequest) =>
  cache(async (params: GetNotesParams) => {
    return await request.get<IPageData<NoteInfo>>('/note', params);
  });

/**
 * 创建 note
 */
export const postNoteAPI =
  (request: IRequest) => async (params: PostNoteParams) => {
    return await request.post<NoteInfo>('/note', {
      body: JSON.stringify(params),
    });
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
    return await request.put<NoteInfo>('/note', {
      body: JSON.stringify(params),
    });
  };
