import { fireEvent, render, screen } from '@testing-library/react';
import { createEditor, Descendant, Node } from 'slate';
import { Slate, withReact } from 'slate-react';
import { beforeEach, describe, expect, it } from 'vitest';
import { saveNoteDraft } from '@/lib/note-draft';
import DraftTip from '.';

const paragraph = (text: string) =>
  [{ type: 'paragraph', children: [{ text }] }] as unknown as Descendant[];

const renderTip = (noteId: string) => {
  const editor = withReact(createEditor());
  render(
    <Slate editor={editor} initialValue={paragraph('original')}>
      <DraftTip noteId={noteId} />
    </Slate>
  );
  return editor;
};

describe('DraftTip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not show drafts that belong to another note', () => {
    saveNoteDraft('note-2', paragraph('other draft'));

    renderTip('note-1');

    expect(screen.queryByText('有已保存的草稿，是否继续编辑？')).toBeNull();
  });

  it('does not apply the legacy global draft', () => {
    localStorage.setItem('note-draft', JSON.stringify(paragraph('legacy')));

    renderTip('note-1');

    expect(screen.queryByText('有已保存的草稿，是否继续编辑？')).toBeNull();
    expect(localStorage.getItem('note-draft')).toBeNull();
  });

  it('restores the current note draft into the editor', () => {
    saveNoteDraft('note-1', paragraph('my draft'));

    const editor = renderTip('note-1');
    fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));

    expect(Node.string(editor)).toBe('my draft');
    expect(screen.queryByText('有已保存的草稿，是否继续编辑？')).toBeNull();
  });

  it('discards the current note draft only', () => {
    saveNoteDraft('note-1', paragraph('my draft'));
    saveNoteDraft('new', paragraph('new draft'));

    const editor = renderTip('note-1');
    fireEvent.click(screen.getByRole('button', { name: '丢弃草稿' }));

    expect(Node.string(editor)).toBe('original');
    expect(localStorage.getItem('note-draft:note-1')).toBeNull();
    expect(localStorage.getItem('note-draft:new')).not.toBeNull();
  });
});
