import { IRequest } from '@/lib/hooks/useRequest';
import { IPageData } from '../types';
import { GetTagsParams, PostTagParams, PutTagParams, TagInfo } from './types';
import { cache } from 'react';

// /**
//  * 获取 tag
//  */
// export const getTagAPI = (request: IRequest) => async (id: string) => {
//   return await request.get<TagInfo>(`/tag/${id}`);
// };

/**
 * 获取 tag 列表
 */
export const getTagsAPI = (request: IRequest) =>
  cache(async (params: GetTagsParams) => {
    return await request.get<IPageData<TagInfo>>('/tag', params);
  });

/**
 * 创建 tag
 */
export const postTagAPI =
  (request: IRequest) => async (params: PostTagParams) => {
    return await request.post<TagInfo>('/tag', {
      body: JSON.stringify(params),
    });
  };

// /**
//  * 删除 tag
//  */
// export const deleteNoteAPI = (request: IRequest) => async (id: string) => {
//   return await request.delete('/tag', {
//     body: JSON.stringify({
//       _id: id,
//     }),
//   });
// };

/**
 * 更新 tag
 */
export const putTagAPI =
  (request: IRequest) => async (params: PutTagParams) => {
    return await request.put<TagInfo>('/tag', {
      body: JSON.stringify(params),
    });
  };
