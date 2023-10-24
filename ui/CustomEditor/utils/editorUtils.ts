import { Editor } from 'slate';
import { CustomEditor } from 'types/slate';
import { MarkType } from '../constans';

const editorUtils = {
  isMarkActive(editor: CustomEditor, type: MarkType) {
    const marks = Editor.marks(editor);
    return marks ? marks[type] === true : false;
  },

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
