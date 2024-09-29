import { CommonInfo } from '../types';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * 数据统计实体
 */
export interface NoteEntity extends CommonInfo {
  wordCount: number;
  noteCount: number;
  viewCount: number;
  likeCount: number;
  contributes: {
    date: number;
    count: number;
  }[];
}

/**
 * 数据统计信息
 */
export type StatisticsInfo = Pick<NoteEntity, '_id' | 'wordCount' | 'noteCount' | 'viewCount' | 'likeCount' | 'contributes' | 'createdAt'>;

