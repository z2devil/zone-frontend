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
}

/**
 * 创建 tag 参数
 */
export interface PostTagParams {
  label: string;
}

/**
 * 更新 tag 参数
 */
export interface PutTagParams extends PostTagParams {
  _id: string;
}
