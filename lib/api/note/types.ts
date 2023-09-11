import { IPageParams } from '../common';

/**
 * note 类型枚举
 */
export enum NoteTypeEnum {
  NOTE = 0,
  ARTICLE,
}

interface CommonInfo {
  _id: number;
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
export type LoadNotesParams = IPageParams &
  (
    | {
        search?: string;
      }
    | {
        _id?: string;
      }
  );
