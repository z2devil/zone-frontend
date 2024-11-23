import { BlockElementType, InlineElementType, MarkType } from '@/lib/constants';
import { Editor, Element, Node, Range, Transforms } from 'slate';
import { RichEditor, CustomElement, ElementType } from 'types/slate';
import { CustomText } from 'types/slate';

export const editorUtils = {
  /**
   * 判断当前选中的节点是否包含指定的 mark 的类型
   * @param editor 编辑器
   * @param type mark 类型
   * @returns
   */
  isMarkActive(editor: RichEditor, type: MarkType) {
    const marks = Editor.marks(editor);
    return marks ? marks[type] === true : false;
  },

  /**
   * 切换 mark 的状态
   * @param editor 编辑器
   * @param type mark 类型
   */
  toggleMark(editor: RichEditor, type: MarkType) {
    const isActive = editorUtils.isMarkActive(editor, type);
    console.log('[ toggleMark ]', isActive, type);
    if (isActive) {
      Editor.removeMark(editor, type);
    } else {
      Editor.addMark(editor, type, true);
    }
  },

  /**
   * 插入内联节点
   * @param editor 编辑器
   * @param type inline element 类型
   */
  insertInlineNode(editor: RichEditor, type: InlineElementType) {
    Transforms.insertNodes(editor, {
      type,
      children: [
        {
          text: '',
        },
      ],
    } as Node);
  },

  /**
   * 插入块节点
   * @param editor 编辑器
   * @param type block element 类型
   * @returns
   */
  insertBlockNode(
    editor: RichEditor,
    type: BlockElementType,
    children: (CustomText | CustomElement)[] = [{ text: '' }]
  ) {
    // TODO: 需要先获取当前选中的行，判断行内是否有除了 p 以外的其他元素，如果有，则将 btn 置灰；
    // 不同按钮的置灰逻辑不同，需要根据具体的按钮来判断
    Transforms.insertNodes(editor, {
      type,
      children,
    } as Node);
  },

  /**
   * 判断当前选中的节点是否包含指定的 element 的类型
   * @param editor 编辑器
   * @param type element 类型
   * @returns
   */
  isElementActive(editor: RichEditor, type: ElementType) {
    const [match] = Editor.nodes(editor, {
      match: n =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
    });
    return !!match;
  },

  /**
   * 解包节点
   * @param editor 编辑器
   * @param type element 类型
   */
  unwrapElement(editor: RichEditor, type: ElementType) {
    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
    });
  },

  /**
   * 包裹节点
   * @param editor 编辑器
   * @param type element 类型
   */
  wrapElement(editor: RichEditor, type: ElementType) {
    const isActive = editorUtils.isElementActive(editor, type);
    console.log('[ wrapNode ]', isActive, type);
    if (isActive) {
      editorUtils.unwrapElement(editor, type);
    } else {
      const { selection } = editor;
      const isCollapsed = selection && Range.isCollapsed(selection);
      const text = selection ? Editor.string(editor, selection) : '';
      const element: CustomElement = {
        type,
        children: [{ text }],
      };
      console.log('[ wrapElement ]', isCollapsed, text, element);
      if (isCollapsed) {
        Transforms.insertNodes(editor, element);
      } else {
        Transforms.wrapNodes(editor, element, { split: true });
        Transforms.collapse(editor, { edge: 'end' });
      }
    }
  },
};
