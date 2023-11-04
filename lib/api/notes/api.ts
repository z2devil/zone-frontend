import request from '@/lib/api/request';
import { IPageData } from '../types';
import { GetNotesParams, NoteEntity, PostNoteParams } from './types';
import { cache } from 'react';

/**
 * 获取 note 列表
 */
export const getNotesAPI = cache(async (params: GetNotesParams) => {
  return await request.get<IPageData<NoteEntity>>('/note', params);
});

/**
 * 创建 note
 */
export const postNoteAPI = async (params: PostNoteParams) => {
  return await request.post('/note', {
    body: JSON.stringify(params),
  });
};

// /**
//  * 阅读通知
//  */
// export const readNotice = async (params: { id: number }) => {
//   return await service.post<ReadNoticeResult>('/notice/readNotice', params);
// };

// /**
//  * 检查有无未读通知
//  */
// export const hasUnReadNotices = async () => {
//   return await service.post<hasUnReadNoticesResult>('/notice/unRead');
// };

// /**
//  * 获取风险通知
//  */
// export const getRiskNotice = async (params: PageType) => {
//   return await service.post<LoadNoticesResult>(
//     '/notice/riskAlertNotice',
//     params
//   );
// };
