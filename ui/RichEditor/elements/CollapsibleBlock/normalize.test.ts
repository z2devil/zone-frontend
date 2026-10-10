import { createEditor, Descendant, Editor } from 'slate';
import { withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { BlockElementType } from '@/lib/constants';
import collapsibleBlockPlugin from '.';

const p = (text: string): Descendant => ({
  type: BlockElementType.PARAGRAPH,
  children: [{ text }],
});

const title = (...children: unknown[]) =>
  ({
    type: BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
    children,
  }) as unknown as Descendant;

const content = (...children: unknown[]) =>
  ({
    type: BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
    children,
  }) as unknown as Descendant;

const block = (...children: unknown[]) =>
  ({
    type: BlockElementType.COLLAPSIBLE_BLOCK,
    collapsed: true,
    children,
  }) as unknown as Descendant;

const normalize = (value: Descendant[]) => {
  const editor = withReact(createEditor());
  collapsibleBlockPlugin.extendEditor?.(editor);
  editor.children = value;
  Editor.normalize(editor, { force: true });
  return editor.children;
};

describe('collapsible block normalize', () => {
  it('keeps a well-formed block unchanged', () => {
    const value = [block(title(p('标题')), content(p('正文')))];
    expect(normalize(value)).toEqual([
      block(title(p('标题')), content(p('正文'))),
    ]);
  });

  it('inserts an empty title when the title is missing', () => {
    expect(normalize([block(content(p('正文')))])).toEqual([
      block(title(p('')), content(p('正文'))),
    ]);
  });

  it('inserts an empty paragraph content when the content is missing', () => {
    expect(normalize([block(title(p('标题')))])).toEqual([
      block(title(p('标题')), content(p(''))),
    ]);
  });

  it('reorders content before title', () => {
    expect(normalize([block(content(p('正文')), title(p('标题')))])).toEqual([
      block(title(p('标题')), content(p('正文'))),
    ]);
  });

  it('merges extra children into the content in document order', () => {
    const heading = {
      type: BlockElementType.HEADING_2,
      children: [{ text: '小节' }],
    };
    expect(
      normalize([
        block(
          title(p('标题')),
          p('之前'),
          content(p('正文')),
          p('之后'),
          heading
        ),
      ])
    ).toEqual([
      block(
        title(p('标题')),
        content(p('之前'), p('正文'), p('之后'), heading)
      ),
    ]);
  });

  it('wraps loose blocks into a new content when no content exists', () => {
    expect(normalize([block(title(p('标题')), p('一'), p('二'))])).toEqual([
      block(title(p('标题')), content(p('一'), p('二'))),
    ]);
  });

  it('keeps the text of duplicated titles and contents', () => {
    expect(
      normalize([
        block(
          title(p('标题一')),
          content(p('正文一')),
          title(p('标题二')),
          content(p('正文二'))
        ),
      ])
    ).toEqual([
      block(title(p('标题一')), content(p('正文一'), p('标题二'), p('正文二'))),
    ]);
  });

  it('wraps loose text of the block into paragraphs instead of dropping it', () => {
    expect(normalize([block({ text: '散落文本' })])).toEqual([
      block(title(p('')), content(p('散落文本'))),
    ]);
  });

  it('keeps only one paragraph in the title and moves the rest to content', () => {
    expect(
      normalize([block(title(p('标题'), p('第二行')), content(p('正文')))])
    ).toEqual([block(title(p('标题')), content(p('第二行'), p('正文')))]);
  });

  it('converts a text block in the title into a paragraph', () => {
    expect(
      normalize([
        block(
          title({
            type: BlockElementType.HEADING_1,
            children: [{ text: 'H' }],
          }),
          content(p('正文'))
        ),
      ])
    ).toEqual([block(title(p('H')), content(p('正文')))]);
  });

  it('moves a non-text block out of the title into content', () => {
    const image = {
      type: BlockElementType.IMAGE,
      url: 'zone/image/a.png',
      children: [{ text: '' }],
    };
    const value = normalize([block(title(image), content(p('正文')))]);
    expect(value).toEqual([block(title(p('')), content(image, p('正文')))]);
  });

  it('wraps inline text in title and content into paragraphs', () => {
    expect(
      normalize([block(title({ text: '标题' }), content({ text: '正文' }))])
    ).toEqual([block(title(p('标题')), content(p('正文')))]);
  });

  it('fills an empty title and content with a paragraph', () => {
    expect(normalize([block(title(), content())])).toEqual([
      block(title(p('')), content(p(''))),
    ]);
  });

  it('unwraps title and content that live outside a collapsible block', () => {
    expect(normalize([title(p('孤立标题')), content(p('孤立正文'))])).toEqual([
      p('孤立标题'),
      p('孤立正文'),
    ]);
  });
});
