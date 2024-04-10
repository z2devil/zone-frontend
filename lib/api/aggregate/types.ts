import { NoteTypeEnum } from '../notes';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * 标签分类实体
 */
export interface CategoryEntity {
  // tag id
  _id: string;
  // tag label
  label: string;
  // note count
  count: number;
  latestNote: {
    _id: string;
    type: NoteTypeEnum;
    content: string;
    title?: string;
    summary?: string;
  };
}
