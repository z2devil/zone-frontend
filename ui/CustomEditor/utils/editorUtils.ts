import { Editor, Transforms } from 'slate';
import { ElementType } from 'types';
import { CustomEditor } from 'types/slate';

const editorUtils = {
  isBoldMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isCodeLinekActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.code === true : false;
    // const matchedNodes = Array.from(
    //   Editor.nodes(editor, {
    //     match: n => n.type === ElementType.CODE_LINE,
    //   })
    // );

    // console.log('[ isCodeLinekActive ]', matchedNodes);

    // return !!matchedNodes.length;
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

  toggleCodeLine(editor: CustomEditor) {
    const isActive = editorUtils.isCodeLinekActive(editor);
    console.log('[ toggleCodeLine ]', isActive);
    if (isActive) {
      Editor.removeMark(editor, 'code');
    } else {
      Editor.addMark(editor, 'code', true);
    }
    // 遍历选区中的每个节点
    // for (const [node] of Editor.nodes(editor, {
    //   match: n => n.type === ElementType.TEXT,
    // })) {
    //   console.log('[ Editor.nodes ]', node);
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? undefined : ElementType.CODE_LINE },
    //     {
    //       match(node) {
    //         return node.type === ElementType.TEXT;
    //       },
    //       split: true,
    //     }
    //   );
    // }
  },
};

export { editorUtils };
