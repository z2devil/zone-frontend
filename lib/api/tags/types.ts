import { CommonInfo } from '../types';
import { IPageParams } from '../types';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * 标签类型枚举
 */
export enum NoteTypeEnum {
  NOTE = 0,
  ARTICLE,
}

/**
 * 标签实体
 */
export interface NoteEntity extends CommonInfo {
  label: string;
}

/**
 * 标签列表信息
 */
export type TagInfo = Pick<NoteEntity, '_id' | 'label' | 'createdAt'>;

/************************************************
 * ✨ API
 ************************************************/

/**
 * 查询 tags 参数
 */
export interface GetTagsParams extends IPageParams {
  search?: string;
  type?: NoteTypeEnum;
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
