import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WriteNote from './page';

const mocks = vi.hoisted(() => ({
  getNote: vi.fn(),
  putNote: vi.fn(),
  back: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mocks.back }),
}));

vi.mock('@/lib/hooks/useRequest', () => ({
  default: () => [{}, vi.fn()],
}));

vi.mock('@/lib/api/notes', () => ({
  getNoteAPI: () => mocks.getNote,
  postNoteAPI: () => vi.fn(),
  putNoteAPI: () => mocks.putNote,
}));

vi.mock('@/lib/stores', () => ({
  useModalUtilsStore: () => ({ utils: null }),
  useNotificationUtilsStore: () => ({ utils: null }),
}));

vi.mock('@/lib/stores/notes', () => ({
  useNotesStore: () => ({ notes: [], setNotes: vi.fn() }),
}));

vi.mock('@/ui/RichEditor', () => ({
  default: () => <div data-testid='rich-editor' />,
}));

vi.mock('@/ui/RichEditor/components/Toolbar', () => ({
  default: ({ RightSlot }: { RightSlot?: ReactNode }) => <div>{RightSlot}</div>,
}));

vi.mock('@/ui/TOC', () => ({ default: () => null }));

vi.mock('@/ui/NotePublish', () => ({
  default: ({
    options,
    onPublish,
  }: {
    options: unknown;
    onPublish: (options: unknown) => void;
  }) => (
    <button type='button' onClick={() => onPublish(options)}>
      确认发布
    </button>
  ),
}));

vi.mock('@/ui/Motion', () => ({
  MotionList: ({
    keys,
  }: {
    keys: { options: { title: string; children: unknown } }[];
  }) => (
    <>
      {keys.map(info => (
        <div key={info.options.title}>
          {info.options.children as JSX.Element}
        </div>
      ))}
    </>
  ),
}));

// ui/Modal 依赖未声明的 lodash，测试中替换为空实现
vi.mock('@/ui/Modal', () => ({ Modal: () => null }));
vi.mock('@/ui/Modal/hooks/useModal', () => ({}));

// 插件依赖 webpack require.context，测试中使用恒等增强
vi.mock('@/ui/RichEditor/plugins', () => ({
  withPasteMarkdown: <T,>(editor: T) => editor,
  withShortcuts: <T,>(editor: T) => editor,
  withPluginSetup: <T,>(editor: T) => editor,
}));

const note = {
  _id: 'note-1',
  title: 'Hello',
  bannerPath: '',
  tags: [],
  visibility: 'public',
  content: '[{"type":"paragraph","children":[{"text":"hello"}]}]',
};

describe('write page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows an error state without an editor or publish button when loading fails', async () => {
    mocks.getNote.mockRejectedValue(new Error('笔记不存在'));

    render(<WriteNote params={{ id: 'note-1' }} />);

    expect(await screen.findByText('笔记不存在或加载失败')).toBeInTheDocument();
    expect(screen.queryByTestId('rich-editor')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '发布笔记' })
    ).not.toBeInTheDocument();
  });

  it('treats unparsable note content as a load failure', async () => {
    mocks.getNote.mockResolvedValue({ ...note, content: 'not-json' });

    render(<WriteNote params={{ id: 'note-1' }} />);

    expect(await screen.findByText('笔记不存在或加载失败')).toBeInTheDocument();
    expect(screen.queryByTestId('rich-editor')).not.toBeInTheDocument();
  });

  it('retries loading and shows the editor once the note is loaded', async () => {
    mocks.getNote
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(note);

    render(<WriteNote params={{ id: 'note-1' }} />);

    fireEvent.click(await screen.findByRole('button', { name: '重试' }));

    expect(await screen.findByTestId('rich-editor')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '发布笔记' })
    ).toBeInTheDocument();
    expect(mocks.getNote).toHaveBeenCalledTimes(2);
  });

  it('saves drafts under the current note id', async () => {
    mocks.getNote.mockResolvedValue(note);

    render(<WriteNote params={{ id: 'note-1' }} />);
    await screen.findByTestId('rich-editor');

    fireEvent.keyDown(document, { key: 's', metaKey: true });

    expect(localStorage.getItem('note-draft:note-1')).toBe(note.content);
    expect(localStorage.getItem('note-draft')).toBeNull();
  });

  it('clears the current note draft after publishing', async () => {
    mocks.getNote.mockResolvedValue(note);
    mocks.putNote.mockResolvedValue(note);
    localStorage.setItem('note-draft:note-1', note.content);
    localStorage.setItem('note-draft:note-2', note.content);

    render(<WriteNote params={{ id: 'note-1' }} />);
    fireEvent.click(await screen.findByRole('button', { name: '发布笔记' }));
    fireEvent.click(await screen.findByRole('button', { name: '确认发布' }));

    await waitFor(() => {
      expect(localStorage.getItem('note-draft:note-1')).toBeNull();
    });
    expect(localStorage.getItem('note-draft:note-2')).not.toBeNull();
  });

  it('opens the editor directly for a new note', () => {
    render(<WriteNote params={{ id: 'new' }} />);

    expect(screen.getByTestId('rich-editor')).toBeInTheDocument();
    expect(mocks.getNote).not.toHaveBeenCalled();
  });
});
