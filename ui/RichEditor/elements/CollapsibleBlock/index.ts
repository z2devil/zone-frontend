import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import CollapsibleBlockElement from './element';
import { Editor, Element, Range } from 'slate';
import { normalizeCollapsibleEntry } from './normalize';

const collapsibleBlockPlugin = createPlugin({
  name: 'collapsibleBlock',
  element: {
    type: BlockElementType.COLLAPSIBLE_BLOCK,
    component: CollapsibleBlockElement,
  },
  extendEditor: editor => {
    const { deleteBackward, isEmpty, normalizeNode } = editor;

    editor.normalizeNode = (entry, options) => {
      // 必须先于核心规则执行，避免核心规则删除结构异常的子节点
      if (normalizeCollapsibleEntry(editor, entry)) return;
      normalizeNode(entry, options);
    };

    editor.deleteBackward = unit => {
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        const entry = Editor.above(editor, {
          match: n =>
            Element.isElement(n) &&
            n.type === BlockElementType.COLLAPSIBLE_BLOCK,
        });

        if (entry) {
          const [node, path] = entry;
          const isStart = Editor.isStart(
            editor,
            editor.selection?.anchor,
            path
          );

          if (isStart) return;
        }
      }

      deleteBackward(unit);
    };

    editor.isEmpty = (element: any) => {
      if (
        element?.type &&
        element.type === BlockElementType.COLLAPSIBLE_BLOCK
      ) {
        const title = element.children[0];
        const content = element.children[1];
        return isEmpty(title) && isEmpty(content);
      }

      return isEmpty(element);
    };

    return editor;
  },
});

export default collapsibleBlockPlugin;
