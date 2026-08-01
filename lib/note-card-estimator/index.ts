import { NoteInfo } from '@/lib/api/notes';
import { BlockElementType } from '@/lib/constants';
import { parseNoteContent } from '@/lib/note-content/parse';
import { Descendant } from 'slate';
import {
  estimateNoteCardHeight,
  MeasureTextLines,
} from '@/lib/note-card-estimator/model';
import { createPretextTextMeasurer } from '@/lib/note-card-estimator/pretext';

type EstimateNote = Pick<NoteInfo, '_id' | 'bannerPath' | 'content'>;

interface CachedContent {
  content: string;
  value: Descendant[];
}

const FALLBACK_CONTENT: Descendant[] = [
  {
    type: BlockElementType.PARAGRAPH,
    children: [{ text: '暂时无法显示这篇笔记的内容' }],
  },
];

export class NoteCardHeightEstimator {
  private readonly contentCache = new Map<string, CachedContent>();

  constructor(
    private readonly measureTextLines: MeasureTextLines = createPretextTextMeasurer()
  ) {}

  estimate(note: EstimateNote, cardWidth: number) {
    const cached = this.contentCache.get(note._id);
    let content = cached?.value;

    if (!cached || cached.content !== note.content) {
      content = parseNoteContent(note.content) || FALLBACK_CONTENT;
      this.contentCache.set(note._id, {
        content: note.content,
        value: content,
      });
    }

    const resolvedContent = content || FALLBACK_CONTENT;

    return estimateNoteCardHeight(
      {
        bannerPath: note.bannerPath,
        content: resolvedContent,
      },
      cardWidth,
      this.measureTextLines
    );
  }

  retain(noteIds: ReadonlySet<string>) {
    this.contentCache.forEach((_value, noteId) => {
      if (!noteIds.has(noteId)) this.contentCache.delete(noteId);
    });
  }

  clear() {
    this.contentCache.clear();
    const cachedMeasurer = this.measureTextLines as Partial<
      Pick<CachedMeasureTextLines, 'clear'>
    >;
    cachedMeasurer.clear?.();
  }
}

interface CachedMeasureTextLines extends MeasureTextLines {
  clear: () => void;
}

export type { MeasureTextLines } from './model';
