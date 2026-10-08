import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NoteInfo } from '@/lib/api/notes';
import { useNoteDetail } from './useNoteDetail';

const mocks = vi.hoisted(() => ({
  getNote: vi.fn(),
  getAdjacentNotes: vi.fn(),
  // 与真实 useRequest 一致：request 引用在渲染间保持稳定
  requestTuple: [{}],
}));

vi.mock('@/lib/hooks/useRequest', () => ({
  default: () => mocks.requestTuple,
}));

vi.mock('@/lib/api/notes', () => ({
  getNoteAPI: () => mocks.getNote,
  getAdjacentNotesAPI: () => mocks.getAdjacentNotes,
}));

const note = { _id: 'note-1', title: 'Hello' } as NoteInfo;
const prev = { _id: 'note-0', title: 'Prev' } as NoteInfo;

describe('useNoteDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
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
});
