import { Descendant } from 'slate';
import { parseNoteContent } from '@/lib/note-content/parse';

const DRAFT_KEY_PREFIX = 'note-draft:';

/**
 * 旧版全局草稿 key，无法判断属于哪篇笔记，读取时直接清理
 */
const LEGACY_DRAFT_KEY = 'note-draft';

const getDraftKey = (noteId: string) => `${DRAFT_KEY_PREFIX}${noteId}`;

/**
 * 保存笔记草稿。新建笔记使用路由中的 `new` 作为 id
 */
export const saveNoteDraft = (noteId: string, content: Descendant[]) => {
  localStorage.setItem(getDraftKey(noteId), JSON.stringify(content));
};

export const readNoteDraft = (noteId: string): Descendant[] | null => {
  localStorage.removeItem(LEGACY_DRAFT_KEY);
  const draft = localStorage.getItem(getDraftKey(noteId));
  return draft ? parseNoteContent(draft) : null;
};

export const removeNoteDraft = (noteId: string) => {
  localStorage.removeItem(getDraftKey(noteId));
};

/**
 * 清除本地所有笔记草稿（退出登录时调用，避免私密正文残留）
 */
export const clearAllNoteDrafts = () => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === LEGACY_DRAFT_KEY || key?.startsWith(DRAFT_KEY_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
};
