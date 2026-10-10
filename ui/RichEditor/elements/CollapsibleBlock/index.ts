import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import CollapsibleBlockElement from './element';
import { Editor, Element, Path, Range, Transforms } from 'slate';

const collapsibleBlockPlugin = createPlugin({
  name: 'collapsibleBlock',
  element: {
    type: BlockElementType.COLLAPSIBLE_BLOCK,
    component: CollapsibleBlockElement,
  },
  extendEditor: editor => {
    const { deleteBackward, isEmpty, normalizeNode } = editor;

    editor.normalizeNode = entry => {
      normalizeNode(entry);

      const [node, path] = entry;

      if (
        !Element.isElement(node) ||
        node.type !== BlockElementType.COLLAPSIBLE_BLOCK
      )
        return;

      const currentPath = path;
      const titleIndex = node.children.findIndex(
        child =>
          Element.isElement(child) &&
          child.type === BlockElementType.COLLAPSIBLE_BLOCK_TITLE
      );
      const contentIndex = node.children.findIndex(
        child =>
          Element.isElement(child) &&
          child.type === BlockElementType.COLLAPSIBLE_BLOCK_CONTENT
      );

      // 如果没有标题，插入一个
      if (titleIndex === -1) {
        Transforms.insertNodes(
          editor,
          {
            type: BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
            children: [
              {
                type: BlockElementType.PARAGRAPH,
                children: [{ text: '' }],
              },
            ],
          } as any,
          { at: [...currentPath, 0] }
        );
        return;
      }

      // 如果没有内容，插入一个
      if (contentIndex === -1) {
        Transforms.insertNodes(
          editor,
          {
            type: BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
            children: [
              {
                type: BlockElementType.PARAGRAPH,
                children: [{ text: '' }],
              },
            ],
          } as any,
          { at: [...currentPath, titleIndex + 1] }
        );
        return;
      }

      // 确保标题在内容之前
      if (titleIndex > contentIndex) {
        const titlePath = [...currentPath, titleIndex];
        const titleNode = node.children[titleIndex];
        Transforms.removeNodes(editor, { at: titlePath });
        Transforms.insertNodes(editor, titleNode as any, {
          at: [...currentPath, contentIndex],
        });
        return;
      }

      // 确保第一个子元素是标题
      if (titleIndex !== 0) {
        const titlePath = [...currentPath, titleIndex];
        const titleNode = node.children[titleIndex];
        Transforms.removeNodes(editor, { at: titlePath });
        Transforms.insertNodes(editor, titleNode as any, {
          at: [...currentPath, 0],
        });
        return;
      }

      // 确保第二个子元素是内容
      if (contentIndex !== 1) {
        const contentPath = [...currentPath, contentIndex];
        const contentNode = node.children[contentIndex];
        Transforms.removeNodes(editor, { at: contentPath });
        Transforms.insertNodes(editor, contentNode as any, {
          at: [...currentPath, 1],
        });
        return;
      }

      // 移除多余的子元素（保留前两个）
      if (node.children.length > 2) {
        for (let i = node.children.length - 1; i >= 2; i--) {
          Transforms.removeNodes(editor, { at: [...currentPath, i] });
        }
      }
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
