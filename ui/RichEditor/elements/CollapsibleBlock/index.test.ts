import { createEditor, Descendant, Editor, Transforms } from 'slate';
import { withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { BlockElementType } from '@/lib/constants';
import { editorUtils } from '@/ui/RichEditor/utils/editorUtils';
import collapsibleBlockPlugin from '.';

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
  const editor = withReact(createEditor());
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
