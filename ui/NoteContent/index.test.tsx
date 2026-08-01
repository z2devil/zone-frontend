import { render, screen } from '@testing-library/react';
import { Component, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import NoteContent, { NoteContentErrorBoundary } from '.';

class BrokenContent extends Component {
  render(): ReactNode {
    throw new Error('broken note');
  }
}

describe('NoteContent', () => {
  it('keeps the surrounding page available when serialized content is invalid', () => {
    render(
      <>
        <NoteContent content='not-json' />
        <p>其他笔记仍然可见</p>
      </>
    );

    expect(screen.getByText('暂时无法显示这篇笔记的内容')).toBeInTheDocument();
    expect(screen.getByText('其他笔记仍然可见')).toBeInTheDocument();
  });

  it('isolates unexpected rendering errors to the current note', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(
      <NoteContentErrorBoundary>
        <BrokenContent />
      </NoteContentErrorBoundary>
    );

    expect(screen.getByText('暂时无法显示这篇笔记的内容')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
