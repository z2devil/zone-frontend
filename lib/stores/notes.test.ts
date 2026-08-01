import { beforeEach, describe, expect, it } from 'vitest';
import { useNotesStore } from './notes';

describe('notes store', () => {
  beforeEach(() => {
    useNotesStore.setState({
      notes: [],
      filter: { tags: [] },
    });
  });

  it('clears actor-scoped notes and filters on logout', () => {
    useNotesStore.setState({
      notes: [{ _id: 'private-note' } as any],
      filter: { tags: ['secret'], content: 'private' },
    });

    useNotesStore.getState().clear();

    expect(useNotesStore.getState().notes).toEqual([]);
    expect(useNotesStore.getState().filter).toEqual({ tags: [] });
  });
});
