import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import CollapsibleBlockElement from './element';
import { ReactEditor } from 'slate-react';
import { normalizeCollapsibleEntry } from './normalize';
import { moveSelectionOutOfCollapsedContent } from './selection';
import {
  handleCollapsibleBreak,
  handleCollapsibleDeleteBackward,
} from './keyboard';

const collapsibleBlockPlugin = createPlugin({
  name: 'collapsibleBlock',
  element: {
    type: BlockElementType.COLLAPSIBLE_BLOCK,
    component: CollapsibleBlockElement,
  },
  extendEditor: editor => {
    const { deleteBackward, insertBreak, isEmpty, normalizeNode, onChange } =
      editor;

    editor.onChange = options => {
      // 只读模式的展开状态在组件本地，文档中的 collapsed 仅为默认值
      if (!ReactEditor.isReadOnly(editor)) {
        moveSelectionOutOfCollapsedContent(editor);
      }
      onChange(options);
    };

    editor.normalizeNode = (entry, options) => {
      // 必须先于核心规则执行，避免核心规则删除结构异常的子节点
      if (normalizeCollapsibleEntry(editor, entry)) return;
      normalizeNode(entry, options);
    };

    editor.insertBreak = () => {
      if (handleCollapsibleBreak(editor)) return;
      insertBreak();
    };

    editor.deleteBackward = unit => {
      if (handleCollapsibleDeleteBackward(editor)) return;
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
