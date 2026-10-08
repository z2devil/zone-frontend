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
  // 后端仅返回最新笔记的 id 与标题，不含正文
  latestNote: {
    _id: string;
    title?: string;
  };
}
