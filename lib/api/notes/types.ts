import { IPageParams } from '../types';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * note 类型枚举
 */
export enum NoteTypeEnum {
  NOTE = 0,
  ARTICLE,
}

interface CommonInfo {
  _id: string;
  createdAt: string;
}

/**
 * note 实体
 */
export interface NoteEntity extends CommonInfo {
  content: string;
  viewsNum: number;
  type: NoteTypeEnum;
  bannerPath?: string;
  title?: string;
  summary?: string;
}

/************************************************
 * ✨ API
 ************************************************/

/**
 * 查询 notes 参数
 */
export interface GetNotesParams extends IPageParams {
  search?: string;
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
