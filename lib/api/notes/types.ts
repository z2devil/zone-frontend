import { IPageParams } from '../types';

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

/**
 * 查询 notes 参数
 */
export interface GetNotesParams extends IPageParams {
  search?: string;
  _id?: string;
}

export interface PostNoteParams {
  content: string;
  type: NoteTypeEnum;
  bannerPath?: string;
  title?: string;
  summary?: string;
}
