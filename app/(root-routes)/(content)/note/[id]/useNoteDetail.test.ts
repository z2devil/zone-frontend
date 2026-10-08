import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NoteInfo } from '@/lib/api/notes';
import { useNotesStore } from '@/lib/stores/notes';
import { useNoteDetail } from './useNoteDetail';

const mocks = vi.hoisted(() => ({
  getNote: vi.fn(),
  getAdjacentNotes: vi.fn(),
  deleteNote: vi.fn(),
  viewNote: vi.fn(),
  // 与真实 useRequest 一致：request 引用在渲染间保持稳定
  requestTuple: [{}],
}));

vi.mock('@/lib/hooks/useRequest', () => ({
  default: () => mocks.requestTuple,
}));

vi.mock('@/lib/api/notes', () => ({
  getNoteAPI: () => mocks.getNote,
  getAdjacentNotesAPI: () => mocks.getAdjacentNotes,
  deleteNoteAPI: () => mocks.deleteNote,
  viewNoteAPI: () => mocks.viewNote,
}));

const note = { _id: 'note-1', title: 'Hello' } as NoteInfo;
const prev = { _id: 'note-0', title: 'Prev' } as NoteInfo;

describe('useNoteDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.viewNote.mockResolvedValue(null);
  });

  it('loads the note and its adjacent notes', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.getAdjacentNotes.mockResolvedValue({ prev, next: null });

    const { result } = renderHook(() => useNoteDetail('note-1'));

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.note).toEqual(note);
    await waitFor(() =>
      expect(result.current.adjacentNotes).toEqual({ prev, next: null })
    );
  });

  it('reports unavailable when the note is missing or forbidden', async () => {
    mocks.getNote.mockRejectedValue(new Error('笔记不存在'));

    const { result } = renderHook(() => useNoteDetail('hidden-note'));

    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(result.current.note).toBeNull();
    expect(mocks.getAdjacentNotes).not.toHaveBeenCalled();
  });

  it('drops a cached note when the request fails', async () => {
    mocks.getNote.mockRejectedValue(new Error('无权限'));

    const { result } = renderHook(() => useNoteDetail('note-1', note));

    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(result.current.note).toBeNull();
  });

  it('keeps the note readable when adjacent notes fail', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.getAdjacentNotes.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useNoteDetail('note-1'));

    await waitFor(() => expect(mocks.getAdjacentNotes).toHaveBeenCalled());
    expect(result.current.status).toBe('ready');
    expect(result.current.adjacentNotes).toEqual({ prev: null, next: null });
  });

  it('removes the note from the store after a successful delete', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.getAdjacentNotes.mockResolvedValue({ prev: null, next: null });
    mocks.deleteNote.mockResolvedValue(null);
    useNotesStore.setState({ notes: [note, prev] });

    const { result } = renderHook(() => useNoteDetail('note-1'));
    await result.current.deleteNote();

    expect(mocks.deleteNote).toHaveBeenCalledWith('note-1');
    expect(useNotesStore.getState().notes).toEqual([prev]);
  });

  it('keeps the store unchanged when delete fails', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.getAdjacentNotes.mockResolvedValue({ prev: null, next: null });
    mocks.deleteNote.mockRejectedValue(new Error('笔记不存在'));
    useNotesStore.setState({ notes: [note, prev] });

    const { result } = renderHook(() => useNoteDetail('note-1'));

    await expect(result.current.deleteNote()).rejects.toThrow('笔记不存在');
    expect(useNotesStore.getState().notes).toEqual([note, prev]);
  });

  it('records one view after the note loads', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.getAdjacentNotes.mockResolvedValue({ prev: null, next: null });

    const { result, rerender } = renderHook(() => useNoteDetail('note-1'));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    rerender();
    await waitFor(() => expect(mocks.viewNote).toHaveBeenCalledTimes(1));
    expect(mocks.viewNote).toHaveBeenCalledWith('note-1');
  });

  it('does not record the view again when the same id reloads', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.getAdjacentNotes.mockResolvedValue({ prev: null, next: null });

    const { result, rerender } = renderHook(() => useNoteDetail('note-1'));
    await waitFor(() => expect(mocks.viewNote).toHaveBeenCalledTimes(1));

    // 登录态变化会让 request 引用变化并重新加载同一篇笔记
    mocks.requestTuple = [{}];
    rerender();
    await waitFor(() => expect(mocks.getNote).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(mocks.viewNote).toHaveBeenCalledTimes(1);
  });

  it('records a view for each different note id', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.getAdjacentNotes.mockResolvedValue({ prev: null, next: null });

    const { rerender } = renderHook(({ id }) => useNoteDetail(id), {
      initialProps: { id: 'note-1' },
    });
    await waitFor(() => expect(mocks.viewNote).toHaveBeenCalledTimes(1));

    rerender({ id: 'note-2' });
    await waitFor(() => expect(mocks.viewNote).toHaveBeenCalledTimes(2));
    expect(mocks.viewNote).toHaveBeenLastCalledWith('note-2');
  });

  it('does not record a view when the note is unavailable', async () => {
    mocks.getNote.mockRejectedValue(new Error('笔记不存在'));

    const { result } = renderHook(() => useNoteDetail('hidden-note'));

    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(mocks.viewNote).not.toHaveBeenCalled();
  });

  it('keeps the page ready when recording the view fails', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.getAdjacentNotes.mockResolvedValue({ prev: null, next: null });
    mocks.viewNote.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useNoteDetail('note-1'));

    await waitFor(() => expect(mocks.viewNote).toHaveBeenCalled());
    expect(result.current.status).toBe('ready');
    expect(result.current.note).toEqual(note);
  });
});
