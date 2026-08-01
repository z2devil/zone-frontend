'use client';

import { Component, ReactNode, useMemo } from 'react';
import { createEditor, Descendant, Element, Node, Text } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import RichEditor from '@/ui/RichEditor';
import { withPluginSetup } from '@/ui/RichEditor/plugins';

const fallback = (
  <p className='rounded-lg bg-black-50 px-4 py-3 text-sm text-black-400'>
    暂时无法显示这篇笔记的内容
  </p>
);

interface NoteContentErrorBoundaryProps {
  children: ReactNode;
}

interface NoteContentErrorBoundaryState {
  hasError: boolean;
}

export class NoteContentErrorBoundary extends Component<
  NoteContentErrorBoundaryProps,
  NoteContentErrorBoundaryState
> {
  state: NoteContentErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): NoteContentErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? fallback : this.props.children;
  }
}

export const parseNoteContent = (content: string): Descendant[] | null => {
  try {
    const value: unknown = JSON.parse(content);
    if (!Node.isNodeList(value) || value.length === 0) return null;
    if (!value.every(node => Element.isElement(node) || Text.isText(node))) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

interface NoteContentProviderProps {
  children: ReactNode;
  content: string;
  summary?: boolean;
}

interface RenderedNoteContentProviderProps {
  children: ReactNode;
  summary?: boolean;
  value: Descendant[];
}

const RenderedNoteContentProvider = ({
  children,
  summary,
  value,
}: RenderedNoteContentProviderProps) => {
  const editor = useMemo(() => {
    const enhancers = [withReact, withPluginSetup];
    const result = enhancers.reduce(
      (currentEditor, enhancer) => enhancer(currentEditor),
      createEditor()
    );
    result.isSummary = summary;
    return result;
  }, [summary]);

  return (
    <SlateProvider editor={editor} initialValue={value}>
      {children}
    </SlateProvider>
  );
};

export const NoteContentProvider = ({
  children,
  content,
  summary,
}: NoteContentProviderProps) => {
  const value = useMemo(() => parseNoteContent(content), [content]);
  if (!value) return fallback;

  return (
    <NoteContentErrorBoundary key={content}>
      <RenderedNoteContentProvider summary={summary} value={value}>
        {children}
      </RenderedNoteContentProvider>
    </NoteContentErrorBoundary>
  );
};

interface NoteContentProps {
  className?: string;
  content: string;
  summary?: boolean;
}

const NoteContent = ({ className, content, summary }: NoteContentProps) => (
  <NoteContentProvider content={content} summary={summary}>
    <RichEditor className={className} readonly />
  </NoteContentProvider>
);

export default NoteContent;
