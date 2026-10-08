import { act, renderHook } from '@testing-library/react';
import { createEditor, Descendant, Editor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNoteEditState } from './useNoteEditState';

const mocks = vi.hoisted(() => ({
  back: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  openNotification: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mocks.back }),
}));

vi.mock('@/lib/stores', () => ({
  useModalUtilsStore: () => ({
    utils: { open: mocks.openModal, close: mocks.closeModal },
  }),
  useNotificationUtilsStore: () => ({
    utils: { open: mocks.openNotification },
  }),
}));

const initialContent = [
  { type: 'paragraph', children: [{ text: 'hello' }] },
] as unknown as Descendant[];

const setup = (step = 0) => {
  const editor = createEditor();
  editor.children = initialContent;
  const setStep = vi.fn();
  const hook = renderHook(() =>
    useNoteEditState({
      editor,
      noteId: 'note-1',
      initialContent,
      step,
      setStep,
    })
  );
  // 模拟 Slate 在每次变更后调用 onChange
  const edit = (fn: (editor: Editor) => void) => {
    act(() => {
      fn(editor);
      hook.result.current.handleChange(editor.children);
      editor.operations = [];
    });
  };
  return { editor, setStep, edit, ...hook };
};

describe('useNoteEditState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts from the loaded content without unsaved changes', () => {
    const { result } = setup();

    expect(result.current.contentRef.current).toBe(initialContent);
    expect(result.current.isSaved).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('ignores selection-only changes', () => {
    const { result, edit } = setup();

    edit(editor => Transforms.select(editor, Editor.start(editor, [])));

    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('marks content edits as unsaved and tracks the latest content', () => {
    const { result, edit } = setup();

    edit(editor =>
      Transforms.insertText(editor, '!', { at: { path: [0, 0], offset: 5 } })
    );

    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(JSON.stringify(result.current.contentRef.current)).toContain(
      'hello!'
    );
  });

  it('saves the draft with ctrl+s and returns to unsaved after further edits', () => {
    const { result, edit } = setup();

    edit(editor =>
      Transforms.insertText(editor, '!', { at: { path: [0, 0], offset: 5 } })
    );
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      );
    });

    expect(result.current.isSaved).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(localStorage.getItem('note-draft:note-1')).toContain('hello!');

    edit(editor =>
      Transforms.insertText(editor, '?', { at: { path: [0, 0], offset: 5 } })
    );

    expect(result.current.isSaved).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('exits without confirmation when there are no unsaved changes', () => {
    const { result, setStep } = setup();

    act(() => result.current.handleBack());
    vi.advanceTimersByTime(400);

    expect(mocks.openModal).not.toHaveBeenCalled();
    expect(setStep).toHaveBeenCalledWith(-1);
    expect(mocks.back).toHaveBeenCalled();
  });

  it('asks for confirmation before exiting with unsaved changes', () => {
    const { result, edit } = setup();

    edit(editor =>
      Transforms.insertText(editor, '!', { at: { path: [0, 0], offset: 5 } })
    );
    act(() => result.current.handleBack());

    expect(mocks.openModal).toHaveBeenCalledTimes(1);
    expect(mocks.back).not.toHaveBeenCalled();

    act(() => mocks.openModal.mock.calls[0][0].onOk());
    vi.advanceTimersByTime(400);

    expect(mocks.back).toHaveBeenCalled();
  });

  it('only steps back from the publish config without leaving the page', () => {
    const { result, setStep, edit } = setup(1);

    edit(editor =>
      Transforms.insertText(editor, '!', { at: { path: [0, 0], offset: 5 } })
    );
    act(() => result.current.handleBack());
    vi.advanceTimersByTime(400);

    expect(mocks.openModal).not.toHaveBeenCalled();
    expect(setStep).toHaveBeenCalledWith(0);
    expect(mocks.back).not.toHaveBeenCalled();
  });

  it('blocks unload only when there are unsaved changes', () => {
    const { edit } = setup();

    const clean = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);

    edit(editor =>
      Transforms.insertText(editor, '!', { at: { path: [0, 0], offset: 5 } })
    );

    const dirty = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
  });
});
