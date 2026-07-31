import type { IRequest } from '@/lib/hooks/useRequest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteNoteAPI, getNoteAPI, postNoteAPI, putNoteAPI } from './api';
import type { NoteInfo, PostNoteParams, PutNoteParams } from './types';

const getMock = vi.fn();
const postMock = vi.fn();
const putMock = vi.fn();
const deleteMock = vi.fn();

const request: IRequest = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    getMock(url, params) as Promise<T>,
  post: <T>(url: string, config?: RequestInit) =>
    postMock(url, config) as Promise<T>,
  put: <T>(url: string, config?: RequestInit) =>
    putMock(url, config) as Promise<T>,
  delete: <T>(url: string, config?: RequestInit) =>
    deleteMock(url, config) as Promise<T>,
};

const note: NoteInfo = {
  _id: 'note-1',
  author: 'user-1',
  content: '[{"type":"paragraph","children":[{"text":"hello"}]}]',
  createdAt: '2026-07-31T00:00:00.000Z',
  tags: [],
  title: 'Hello',
};

describe('notes API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests a note by id', async () => {
    getMock.mockResolvedValue(note);

    await expect(getNoteAPI(request)('note-1')).resolves.toEqual(note);
    expect(getMock).toHaveBeenCalledWith('/note/note-1', undefined);
  });

  it('serializes the create payload without adding ownership fields', async () => {
    const params: PostNoteParams = {
      content: note.content,
      tags: ['tag-1'],
      title: note.title,
    };
    postMock.mockResolvedValue(note);

    await expect(postNoteAPI(request)(params)).resolves.toEqual(note);
    expect(postMock).toHaveBeenCalledWith('/note', {
      body: JSON.stringify(params),
    });
  });

  it('serializes the update payload including its id', async () => {
    const params: PutNoteParams = {
      _id: note._id,
      content: note.content,
      title: note.title,
    };
    putMock.mockResolvedValue(note);

    await expect(putNoteAPI(request)(params)).resolves.toEqual(note);
    expect(putMock).toHaveBeenCalledWith('/note', {
      body: JSON.stringify(params),
    });
  });

  it('deletes a note by id', async () => {
    deleteMock.mockResolvedValue(null);

    await deleteNoteAPI(request)('note-1');
    expect(deleteMock).toHaveBeenCalledWith('/note', {
      body: JSON.stringify({ _id: 'note-1' }),
    });
  });
});
