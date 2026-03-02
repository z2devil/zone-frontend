import { TagInfo } from '../tags';
import { CommonInfo } from '../types';
import { IPageParams } from '../types';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * 笔记实体
 */
export interface NoteEntity extends CommonInfo {
  content: string;
  viewsNum: number;
  bannerPath?: string;
  title?: string;
}

/**
 * 笔记列表信息
 */
export type NoteInfo = Pick<
  NoteEntity,
  '_id' | 'content' | 'title' | 'bannerPath' | 'createdAt'
> & {
  author: {
    _id: string;
    nickname: string;
    avatarPath: string;
  };
  tags: TagInfo[];
};

/************************************************
 * ✨ API
 ************************************************/

/**
 * 查询 notes 参数
 */
export interface GetNotesParams extends IPageParams {
  search?: string;
  tags?: string[];
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
  bannerPath?: string;
  title?: string;
  tags?: string[];
}

/**
 * 更新 note 参数
 */
export interface PutNoteParams extends PostNoteParams {
  _id: string;
}
