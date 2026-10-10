import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentType } from 'react';
import { createEditor, Descendant } from 'slate';
import { Editable, RenderElementProps, Slate, withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { BlockElementType } from '@/lib/constants';
import collapsibleBlockPlugin from '.';
import CollapsibleBlock from './element';
import CollapsibleBlockTitle from '../CollapsibleBlockTitle/element';
import CollapsibleBlockContent from '../CollapsibleBlockContent/element';

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

const createValue = (collapsed: boolean, titleText = '标题'): Descendant[] => [
  {
    type: BlockElementType.COLLAPSIBLE_BLOCK,
    collapsed,
    children: [
      {
        type: BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
        children: [
          { type: BlockElementType.PARAGRAPH, children: [{ text: titleText }] },
        ],
      },
      {
        type: BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
        children: [
          { type: BlockElementType.PARAGRAPH, children: [{ text: '正文' }] },
        ],
      },
    ],
  } as Descendant,
];

const setup = ({
  collapsed,
  readOnly,
  titleText,
}: {
  collapsed: boolean;
  readOnly: boolean;
  titleText?: string;
}) => {
  const editor = withReact(createEditor());
  collapsibleBlockPlugin.extendEditor?.(editor);
  render(
    <Slate editor={editor} initialValue={createValue(collapsed, titleText)}>
      <Editable readOnly={readOnly} renderElement={renderElement} />
    </Slate>
  );
  return { editor, user: userEvent.setup() };
};

const collapsedOf = (editor: ReturnType<typeof setup>['editor']) =>
  (editor.children[0] as { collapsed?: boolean }).collapsed;

describe('CollapsibleBlock', () => {
  it('lets readers expand and collapse without writing back to the document', async () => {
    const { editor, user } = setup({ collapsed: true, readOnly: true });
    const toggle = screen.getByRole('button', { name: '展开折叠块' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('正文')).not.toBeVisible();

    await user.click(toggle);

    expect(screen.getByRole('button', { name: '收起折叠块' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByText('正文')).toBeVisible();
    expect(collapsedOf(editor)).toBe(true);
  });

  it('toggles when readers click the whole title row', async () => {
    const { user } = setup({ collapsed: false, readOnly: true });

    await user.click(screen.getByText('标题'));

    expect(screen.getByText('正文')).not.toBeVisible();
    expect(screen.getByRole('button', { name: '展开折叠块' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('supports keyboard toggling with Enter and Space', async () => {
    const { user } = setup({ collapsed: true, readOnly: true });

    await user.tab();
    expect(screen.getByRole('button', { name: '展开折叠块' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(screen.getByText('正文')).toBeVisible();

    await user.keyboard(' ');
    expect(screen.getByText('正文')).not.toBeVisible();
  });

  it('writes the default collapsed state back to the document in edit mode', async () => {
    const { editor, user } = setup({ collapsed: false, readOnly: false });

    await user.click(screen.getByRole('button', { name: '收起折叠块' }));

    expect(collapsedOf(editor)).toBe(true);
    // 内容节点仍然渲染，只是被隐藏，避免 Slate 找不到 DOM 节点
    expect(screen.getByText('正文')).toBeInTheDocument();
    expect(screen.getByText('正文')).not.toBeVisible();
  });

  it('does not toggle when the author clicks the title text', async () => {
    const { editor, user } = setup({ collapsed: false, readOnly: false });

    await user.click(screen.getByText('标题'));

    expect(collapsedOf(editor)).toBe(false);
    expect(screen.getByText('正文')).toBeVisible();
  });

  it('shows a title placeholder only while editing an empty title', () => {
    setup({ collapsed: false, readOnly: false, titleText: '' });
    expect(screen.getByText('折叠标题')).toBeInTheDocument();
  });

  it('hides the title placeholder for readers', () => {
    setup({ collapsed: false, readOnly: true, titleText: '' });
    expect(screen.queryByText('折叠标题')).not.toBeInTheDocument();
  });
});
