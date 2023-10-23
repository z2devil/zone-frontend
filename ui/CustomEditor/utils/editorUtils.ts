import { Editor, Node, Transforms } from 'slate';
import { ElementType } from 'types';
import { CustomEditor, CustomElement } from 'types/slate';

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
          return n.type === ElementType.CODE_LINE;
        },
      }).next()).done
    ) {
      console.log('[ generator ]', result.value);
    }

    return !!result;
  },

  toggleBoldMark(editor: CustomEditor) {
    const isActive = editorUtils.isBoldMarkActive(editor);
    console.log('[ toggleBoldMark ]', isActive);
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
      { type: isActive ? undefined : ElementType.CODE_LINE },
      { match: n => Editor.isBlock(editor, n) }
    );
  },

  getCommonBlock(editor: CustomEditor) {
    if (editor.selection) {
      // editor.setSelection({
      //   anchor: {
      //     path: [0, 0],
      //     offset: 0,
      //   },
      //   focus: {
      //     path: [0, 0],
      //     offset: 15,
      //   },
      // });
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 2 },
      });
      // Transforms.move(editor, {
      //   distance: 3,
      //   unit: 'word',
      //   reverse: true,
      // });
      Transforms.insertText(editor, 'some words', {
        at: [0, 0],
      });
      return;
    }

    const range = Editor.unhangRange(editor, editor.selection, { voids: true });

    const [common, path] = Node.common(
      editor,
      range.anchor.path,
      range.focus.path
    );

    if (
      Editor.isBlock(editor, common as CustomElement) ||
      Editor.isEditor(common)
    ) {
      return [common, path];
    } else {
      return Editor.above(editor, {
        at: path,
        match: n =>
          Editor.isBlock(editor, n as CustomElement) || Editor.isEditor(n),
      });
    }
  },
};

export { editorUtils };
