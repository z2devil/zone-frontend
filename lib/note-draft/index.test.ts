import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAllNoteDrafts,
  readNoteDraft,
  removeNoteDraft,
  saveNoteDraft,
} from '.';

const content = [{ type: 'paragraph', children: [{ text: 'draft' }] }];

describe('note draft storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores drafts per note id', () => {
    saveNoteDraft('note-1', content as never);

    expect(readNoteDraft('note-1')).toEqual(content);
    expect(readNoteDraft('note-2')).toBeNull();
    expect(readNoteDraft('new')).toBeNull();
  });

  it('removes only the given note draft', () => {
    saveNoteDraft('note-1', content as never);
    saveNoteDraft('new', content as never);

    removeNoteDraft('note-1');

    expect(readNoteDraft('note-1')).toBeNull();
    expect(readNoteDraft('new')).toEqual(content);
  });

  it('ignores invalid draft content', () => {
    localStorage.setItem('note-draft:note-1', 'not-json');

    expect(readNoteDraft('note-1')).toBeNull();
  });

  it('never applies the legacy global draft and cleans it up', () => {
    localStorage.setItem('note-draft', JSON.stringify(content));

    expect(readNoteDraft('note-1')).toBeNull();
    expect(readNoteDraft('new')).toBeNull();
    expect(localStorage.getItem('note-draft')).toBeNull();
  });

  it('clears every note draft including the legacy key', () => {
    saveNoteDraft('note-1', content as never);
    saveNoteDraft('new', content as never);
    localStorage.setItem('note-draft', JSON.stringify(content));
    localStorage.setItem('other', 'keep');

    clearAllNoteDrafts();

    expect(localStorage.getItem('note-draft:note-1')).toBeNull();
    expect(localStorage.getItem('note-draft:new')).toBeNull();
    expect(localStorage.getItem('note-draft')).toBeNull();
    expect(localStorage.getItem('other')).toBe('keep');
  });
});
