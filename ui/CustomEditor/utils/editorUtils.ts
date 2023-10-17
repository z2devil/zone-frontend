import { Editor, Transforms } from 'slate';
import { CustomEditor } from 'types/slate';

const editorUtils = {
  isBoldMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isCodeBlockActive(editor: CustomEditor) {
    let result;
    while (
      !(result = Editor.nodes(editor, {
        match: n => {
          console.log('[ match ]', n);
          return n.type === 'code';
        },
      }).next()).done
    ) {
      console.log('[ generator ]', result.value);
    }

    return !!result;
  },

  toggleBoldMark(editor: CustomEditor) {
    const isActive = editorUtils.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, 'bold');
    } else {
      Editor.addMark(editor, 'bold', true);
    }
  },

  toggleCodeBlock(editor: CustomEditor) {
    const isActive = editorUtils.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? undefined : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    );
  },
};

export { editorUtils };
