import { createEditor, Descendant, Editor, Transforms } from 'slate';
import { withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { BlockElementType } from '@/lib/constants';
import { editorUtils } from '@/ui/RichEditor/utils/editorUtils';
import { withShortcuts } from '@/ui/RichEditor/plugins/withShortcuts';
import collapsibleBlockPlugin from '.';
import { exitCollapsibleBlock } from './keyboard';

const p = (text: string): Descendant => ({
  type: BlockElementType.PARAGRAPH,
  children: [{ text }],
});

const collapsible = (
  titleText: string,
  contentChildren: unknown[],
  collapsed = false
) =>
  ({
    type: BlockElementType.COLLAPSIBLE_BLOCK,
    collapsed,
    children: [
      {
        type: BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
        children: [p(titleText)],
      },
      {
        type: BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
        children: contentChildren,
      },
    ],
  }) as unknown as Descendant;

const createTestEditor = (value: Descendant[]) => {
  // 与线上一致：withShortcuts 在插件之前应用
  const editor = withShortcuts(withReact(createEditor()));
  collapsibleBlockPlugin.extendEditor?.(editor);
  editor.children = value;
  return editor;
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('collapsible block selection', () => {
  it('moves the selection to the title end when its content gets collapsed', async () => {
    const editor = createTestEditor([collapsible('标题', [p('正文')])]);
    Transforms.select(editor, { path: [0, 1, 0, 0], offset: 1 });

    editorUtils.toggleCollapsibleBlock(editor, [0]);
    await flush();

    expect(editor.selection).toEqual({
      anchor: { path: [0, 0, 0, 0], offset: 2 },
      focus: { path: [0, 0, 0, 0], offset: 2 },
    });
  });

  it('pulls the selection out of hidden content after other edits', async () => {
    const editor = createTestEditor([
      collapsible('标题', [p('正文')], true),
      p(''),
    ]);
    Transforms.select(editor, Editor.end(editor, [0, 1]));
    await flush();

    expect(editor.selection?.anchor).toEqual({
      path: [0, 0, 0, 0],
      offset: 2,
    });
  });

  it('keeps the selection inside expanded content', async () => {
    const editor = createTestEditor([collapsible('标题', [p('正文')])]);
    Transforms.select(editor, { path: [0, 1, 0, 0], offset: 1 });
    await flush();

    expect(editor.selection?.anchor).toEqual({
      path: [0, 1, 0, 0],
      offset: 1,
    });
  });
});

const point = (path: number[], offset = 0) => ({ path, offset });
const caret = (path: number[], offset = 0) => ({
  anchor: point(path, offset),
  focus: point(path, offset),
});

describe('collapsible block keyboard', () => {
  it('moves the caret to the first content line on Enter in the title', () => {
    const editor = createTestEditor([collapsible('标题', [p('正文')])]);
    Transforms.select(editor, point([0, 0, 0, 0], 1));

    Editor.insertBreak(editor);

    expect(editor.children).toEqual([collapsible('标题', [p('正文')])]);
    expect(editor.selection).toEqual(caret([0, 1, 0, 0]));
  });

  it('expands a collapsed block before moving into its content', () => {
    const editor = createTestEditor([collapsible('标题', [p('正文')], true)]);
    Transforms.select(editor, point([0, 0, 0, 0], 2));

    Editor.insertBreak(editor);

    expect(editor.children).toEqual([collapsible('标题', [p('正文')], false)]);
    expect(editor.selection).toEqual(caret([0, 1, 0, 0]));
  });

  it('turns an empty block into a paragraph on Backspace at its start', () => {
    const editor = createTestEditor([p('上一段'), collapsible('', [p('')])]);
    Transforms.select(editor, point([1, 0, 0, 0]));

    Editor.deleteBackward(editor);

    expect(editor.children).toEqual([p('上一段'), p('')]);
    expect(editor.selection).toEqual(caret([1, 0]));
  });

  it.each([
    ['title has text', collapsible('标题', [p('')])],
    ['content has text', collapsible('', [p('正文')])],
  ])('keeps the block on Backspace at its start when %s', (_, block) => {
    const editor = createTestEditor([p('上一段'), block]);
    Transforms.select(editor, point([1, 0, 0, 0]));

    Editor.deleteBackward(editor);

    expect(editor.children).toEqual([p('上一段'), block]);
  });

  it('does not delete content text on Backspace at the content start', () => {
    const editor = createTestEditor([
      collapsible('标题', [p('第一行'), p('第二行')]),
    ]);
    Transforms.select(editor, point([0, 1, 0, 0]));

    Editor.deleteBackward(editor);

    expect(editor.children).toEqual([
      collapsible('标题', [p('第一行'), p('第二行')]),
    ]);
    expect(editor.selection).toEqual(caret([0, 0, 0, 0], 2));
  });

  it('removes an empty first content line on Backspace', () => {
    const editor = createTestEditor([
      collapsible('标题', [p(''), p('第二行')]),
    ]);
    Transforms.select(editor, point([0, 1, 0, 0]));

    Editor.deleteBackward(editor);

    expect(editor.children).toEqual([collapsible('标题', [p('第二行')])]);
    expect(editor.selection).toEqual(caret([0, 1, 0, 0]));
  });

  it.each([
    ['non-empty', '后文', [collapsible('标题', [p('正文')], true), p('后文')]],
    ['empty', '', [collapsible('标题', [p('正文')], true)]],
  ])(
    'does not merge a %s next line into hidden content on Backspace',
    (_, text, expected) => {
      const editor = createTestEditor([
        collapsible('标题', [p('正文')], true),
        p(text),
      ]);
      Transforms.select(editor, point([1, 0]));

      Editor.deleteBackward(editor);

      expect(editor.children).toEqual(expected);
      expect(editor.selection).toEqual(caret([0, 0, 0, 0], 2));
    }
  );

  it('leaves the block on Enter in an empty last content line', () => {
    const editor = createTestEditor([collapsible('标题', [p('正文'), p('')])]);
    Transforms.select(editor, point([0, 1, 1, 0]));

    Editor.insertBreak(editor);

    expect(editor.children).toEqual([collapsible('标题', [p('正文')]), p('')]);
    expect(editor.selection).toEqual(caret([1, 0]));
  });

  it('keeps the only content line when leaving from it', () => {
    const editor = createTestEditor([collapsible('标题', [p('')])]);
    Transforms.select(editor, point([0, 1, 0, 0]));

    Editor.insertBreak(editor);

    expect(editor.children).toEqual([collapsible('标题', [p('')]), p('')]);
    expect(editor.selection).toEqual(caret([1, 0]));
  });

  it('splits lines normally elsewhere in the content', () => {
    const editor = createTestEditor([collapsible('标题', [p('正文')])]);
    Transforms.select(editor, point([0, 1, 0, 0], 2));

    Editor.insertBreak(editor);

    expect(editor.children).toEqual([collapsible('标题', [p('正文'), p('')])]);
  });

  it('inserts a paragraph after the block when leaving with Shift+Enter', () => {
    const editor = createTestEditor([
      collapsible('标题', [p('正文')]),
      p('后'),
    ]);
    Transforms.select(editor, point([0, 1, 0, 0], 1));

    expect(exitCollapsibleBlock(editor)).toBe(true);

    expect(editor.children).toEqual([
      collapsible('标题', [p('正文')]),
      p(''),
      p('后'),
    ]);
    expect(editor.selection).toEqual(caret([1, 0]));
  });
});

describe('insert collapsible block', () => {
  const emptyBlock = () => collapsible('', [p('')]);

  it('replaces the empty paragraph it is inserted into and focuses the title', () => {
    const editor = createTestEditor([p('上一段'), p('')]);
    Transforms.select(editor, point([1, 0]));

    editorUtils.insertCollapsibleBlock(editor);

    expect(editor.children).toEqual([p('上一段'), emptyBlock()]);
    expect(editor.selection).toEqual(caret([1, 0, 0, 0]));
  });

  it('inserts after a non-empty paragraph and focuses the title', () => {
    const editor = createTestEditor([p('上一段')]);
    Transforms.select(editor, point([0, 0], 3));

    editorUtils.insertCollapsibleBlock(editor);

    expect(editor.children).toEqual([p('上一段'), emptyBlock()]);
    expect(editor.selection).toEqual(caret([1, 0, 0, 0]));
  });

  it('inserts at the document end and focuses the title without a selection', () => {
    const editor = createTestEditor([p('上一段')]);

    editorUtils.insertCollapsibleBlock(editor);

    expect(editor.children).toEqual([p('上一段'), emptyBlock()]);
    expect(editor.selection).toEqual(caret([1, 0, 0, 0]));
  });
});
