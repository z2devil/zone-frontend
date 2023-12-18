import { CommonInfo } from '../types';
import { IPageParams } from '../types';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * 笔记类型枚举
 */
export enum NoteTypeEnum {
  NOTE = 0,
  ARTICLE,
}

/**
 * 笔记实体
 */
export interface NoteEntity extends CommonInfo {
  content: string;
  viewsNum: number;
  type: NoteTypeEnum;
  bannerPath?: string;
  title?: string;
  summary?: string;
}

/**
 * 笔记列表信息
 */
export type NoteInfo = Pick<
  NoteEntity,
  '_id' | 'type' | 'content' | 'title' | 'summary' | 'bannerPath' | 'createdAt'
> & {
  author: string;
};

/************************************************
 * ✨ API
 ************************************************/

/**
 * 查询 notes 参数
 */
export interface GetNotesParams extends IPageParams {
  search?: string;
  type?: NoteTypeEnum;
}

/**
 * 相邻笔记信息
 */
export interface AdjacentNotes {
  next: NoteInfo | null;
  prev: NoteInfo | null;
}

/**
 * 创建 note 参数
 */
export interface PostNoteParams {
  content: string;
  type: NoteTypeEnum;
  bannerPath?: string;
  title?: string;
  summary?: string;
}

/**
 * 更新 note 参数
 */
export interface PutNoteParams extends PostNoteParams {
  _id: string;
}
