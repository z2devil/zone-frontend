import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import HeadingElement from './element';
import { Editor, Element, Range, Transforms } from 'slate';

const headingPlugin = createPlugin({
  name: 'heading',
  element: {
    type: [
      BlockElementType.HEADING_1,
      BlockElementType.HEADING_2,
      BlockElementType.HEADING_3,
      BlockElementType.HEADING_4,
      BlockElementType.HEADING_5,
      BlockElementType.HEADING_6,
    ],
    component: HeadingElement,
  },
  extendEditor: editor => {
    const { deleteBackward } = editor;

    editor.deleteBackward = unit => {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        const headingEntry = Editor.above(editor, {
          match: n =>
            Element.isElement(n) &&
            [
              BlockElementType.HEADING_1,
              BlockElementType.HEADING_2,
              BlockElementType.HEADING_3,
              BlockElementType.HEADING_4,
              BlockElementType.HEADING_5,
              BlockElementType.HEADING_6,
            ].includes(n.type as BlockElementType),
        });

        if (headingEntry) {
          const [headingNode, headingPath] = headingEntry;
          const isHeadingStart = Editor.isStart(
            editor,
            selection.anchor,
            headingPath
          );
          const isHeadingEmpty = Editor.string(editor, headingPath) === '';

          if (isHeadingStart && isHeadingEmpty) {
            // 将 Heading 转换为段落
            Transforms.setNodes(
              editor,
              { type: BlockElementType.PARAGRAPH },
              { at: headingPath }
            );
            return;
          }
        }
      }

      deleteBackward(unit);
    };

    return editor;
  },
});

export default headingPlugin;
