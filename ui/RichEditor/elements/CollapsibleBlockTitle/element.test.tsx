import { act, fireEvent, render } from '@testing-library/react';
import { ComponentType } from 'react';
import { createEditor, Descendant, Editor, Node, Transforms } from 'slate';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  Slate,
  withReact,
} from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { BlockElementType } from '@/lib/constants';
import collapsibleBlockPlugin from '../CollapsibleBlock';
import CollapsibleBlock from '../CollapsibleBlock/element';
import CollapsibleBlockContent from '../CollapsibleBlockContent/element';
import CollapsibleBlockTitle from './element';

// 模拟桌面 Chrome 的输入路径：slate-react 在模块加载时根据 UA 与 getTargetRanges 选择输入路径，
// 需在导入前设置。Chrome 中 beforeinput 的目标范围即当前 DOM 选区。
vi.hoisted(() => {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });
  // jsdom 未实现 isContentEditable，slate-dom 依赖它判断 DOM 光标是否可编辑
  Object.defineProperty(window.HTMLElement.prototype, 'isContentEditable', {
    configurable: true,
    get(this: HTMLElement) {
      const host = this.closest('[contenteditable]');
      return !!host && host.getAttribute('contenteditable') !== 'false';
    },
  });
  Object.defineProperty(window.InputEvent.prototype, 'getTargetRanges', {
    configurable: true,
    value() {
      const selection = window.getSelection();
      return selection && selection.rangeCount > 0
        ? [selection.getRangeAt(0)]
        : [];
    },
  });
});

const components: Record<string, ComponentType<any>> = {
  [BlockElementType.COLLAPSIBLE_BLOCK]: CollapsibleBlock,
  [BlockElementType.COLLAPSIBLE_BLOCK_TITLE]: CollapsibleBlockTitle,
  [BlockElementType.COLLAPSIBLE_BLOCK_CONTENT]: CollapsibleBlockContent,
};

const renderElement = (props: RenderElementProps) => {
  const Component = components[props.element.type];
  if (Component) return <Component {...props} />;
  return <p {...props.attributes}>{props.children}</p>;
};

const p = (text: string): Descendant => ({
  type: BlockElementType.PARAGRAPH,
  children: [{ text }],
});

const createValue = (titleText: string): Descendant[] => [
  p('块外段落'),
  {
    type: BlockElementType.COLLAPSIBLE_BLOCK,
    collapsed: false,
    children: [
      {
        type: BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
        children: [p(titleText)],
      },
      {
        type: BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
        children: [p('')],
      },
    ],
  } as Descendant,
];

const setup = ({
  readOnly = false,
  titleText = '',
}: { readOnly?: boolean; titleText?: string } = {}) => {
  const editor = withReact(createEditor());
  collapsibleBlockPlugin.extendEditor?.(editor);
  const { container } = render(
    <Slate editor={editor} initialValue={createValue(titleText)}>
      <Editable readOnly={readOnly} renderElement={renderElement} />
    </Slate>
  );
  const editable = container.querySelector(
    '[data-slate-editor]'
  ) as HTMLElement;
  editable.focus();
  const titleElement = () =>
    ReactEditor.toDOMNode(editor, Node.get(editor, [1, 0]));
  return { editor, editable, titleElement };
};

/** 模拟光标原本停在块外段落末尾 */
const selectOutsideParagraph = async (editor: Editor) => {
  await act(async () => {
    Transforms.select(editor, Editor.end(editor, [0]));
    await new Promise(resolve => setTimeout(resolve, 50));
  });
};

const titleText = (editor: Editor) => Node.string(Node.get(editor, [1, 0]));

/** 把 DOM 光标放到指定文本节点并等待 Slate 节流后的 selectionchange 同步 */
const placeDomCaret = async (textNode: globalThis.Node, offset: number) => {
  const range = document.createRange();
  range.setStart(textNode, offset);
  range.collapse(true);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  await act(async () => {
    document.dispatchEvent(new Event('selectionchange'));
    await new Promise(resolve => setTimeout(resolve, 150));
  });
};

const textNodesOf = (element: HTMLElement) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: globalThis.Node[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
};

describe('CollapsibleBlockTitle', () => {
  it('marks an empty title with a CSS placeholder while editing', () => {
    const { titleElement } = setup();
    expect(titleElement()).toHaveAttribute('data-placeholder', '折叠标题');
  });

  it.each([
    ['readers', { readOnly: true }],
    ['non-empty titles', { titleText: '标题' }],
  ])('does not show the placeholder for %s', (_, options) => {
    const { titleElement } = setup(options);
    expect(titleElement()).not.toHaveAttribute('data-placeholder');
  });

  // 根因：占位曾是标题内 contentEditable=false 的真实文本节点，点击占位时
  // DOM 光标落在其中，Slate 判定不可编辑而不同步选区，随后的输入写到旧选区。
  it('syncs the Slate selection into the title wherever the DOM caret lands in it', async () => {
    const { editor, titleElement } = setup();
    const nodes = textNodesOf(titleElement());
    expect(nodes.length).toBeGreaterThan(0);
    for (const node of nodes) {
      await selectOutsideParagraph(editor);
      await placeDomCaret(node, 0);
      expect(editor.selection?.anchor.path.slice(0, 2)).toEqual([1, 0]);
    }
  });

  it('keeps every character in the title during continuous typing', async () => {
    const { editor, editable, titleElement } = setup();
    await selectOutsideParagraph(editor);
    await placeDomCaret(textNodesOf(titleElement())[0], 0);

    for (const char of '真正的标题') {
      await act(async () => {
        editable.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            data: char,
            inputType: 'insertText',
          })
        );
      });
    }

    expect(titleText(editor)).toBe('真正的标题');
    expect(Node.string(Node.get(editor, [0]))).toBe('块外段落');
  });

  it('keeps IME composed text in the title', async () => {
    const { editor, editable, titleElement } = setup();
    await selectOutsideParagraph(editor);
    await placeDomCaret(textNodesOf(titleElement())[0], 0);

    for (const word of ['真正', '的标题']) {
      fireEvent.compositionStart(editable, { data: '' });
      fireEvent.compositionUpdate(editable, { data: word });
      fireEvent.compositionEnd(editable, { data: word });
      // slate-react 在 compositionend 后的微任务里结束组合状态
      await act(async () => {
        await Promise.resolve();
      });
    }

    expect(titleText(editor)).toBe('真正的标题');
    expect(Node.string(Node.get(editor, [0]))).toBe('块外段落');
  });
});
