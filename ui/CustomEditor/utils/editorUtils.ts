import { Editor } from 'slate';
import { CustomEditor } from 'types/slate';
import { MarkType } from '../constans';

const editorUtils = {
  /**
   * 判断当前选中的节点是否包含指定的 mark 的类型
   * @param editor 编辑器
   * @param type mark 类型
   * @returns
   */
  isMarkActive(editor: CustomEditor, type: MarkType) {
    const marks = Editor.marks(editor);
    return marks ? marks[type] === true : false;
  },

  /**
   * 切换 mark 的状态
   * @param editor 编辑器
   * @param type mark 类型
   */
  toggleMark(editor: CustomEditor, type: MarkType) {
    const isActive = editorUtils.isMarkActive(editor, type);
    console.log('[ toggleMark ]', isActive, type);
    if (isActive) {
      Editor.removeMark(editor, type);
    } else {
      Editor.addMark(editor, type, true);
    }
  },
};

export { editorUtils };
