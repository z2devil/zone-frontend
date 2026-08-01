import type { NoteInfo } from './types';

export const canShareNote = (note: Pick<NoteInfo, 'visibility'>) =>
  note.visibility === 'public';

export const isNoteOwner = (
  note: { author: NoteInfo['author'] | string },
  userId?: string
) => {
  if (!userId) return false;
  const authorId =
    typeof note.author === 'string' ? note.author : note.author._id;
  return authorId === userId;
};
