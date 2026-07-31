import { describe, expect, it } from 'vitest';
import type { NoteInfo } from './types';
import { canShareNote, isNoteOwner } from './visibility';

const note = (overrides: Partial<NoteInfo> = {}): NoteInfo => ({
  _id: 'note-1',
  author: 'user-1',
  content: '[]',
  createdAt: '2026-07-31T00:00:00.000Z',
  tags: [],
  visibility: 'public',
  ...overrides,
});

describe('note visibility helpers', () => {
  it('only allows public notes to be shared', () => {
    expect(canShareNote(note())).toBe(true);
    expect(canShareNote(note({ visibility: 'private' }))).toBe(false);
  });

  it('recognizes both populated and plain author ids', () => {
    expect(isNoteOwner(note(), 'user-1')).toBe(true);
    expect(
      isNoteOwner(note({ author: { _id: 'user-1' } as any }), 'user-1')
    ).toBe(true);
    expect(isNoteOwner(note(), 'user-2')).toBe(false);
  });
});
