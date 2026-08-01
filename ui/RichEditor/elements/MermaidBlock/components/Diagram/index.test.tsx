import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MermaidDiagram from '.';
import { renderMermaid } from '../../mermaidRuntime';

vi.mock('../../mermaidRuntime', () => ({
  renderMermaid: vi.fn(),
}));

const mockedRenderMermaid = vi.mocked(renderMermaid);

describe('MermaidDiagram', () => {
  beforeEach(() => mockedRenderMermaid.mockReset());

  it('renders the generated SVG', async () => {
    mockedRenderMermaid.mockResolvedValue('<svg><title>流程图</title></svg>');

    render(<MermaidDiagram source='flowchart TD' />);

    expect(
      await screen.findByRole('img', { name: 'Mermaid 图表' })
    ).toContainHTML('<svg><title>流程图</title></svg>');
  });

  it('falls back to source when only this diagram is invalid', async () => {
    mockedRenderMermaid.mockResolvedValue('');

    render(<MermaidDiagram source='not a diagram' />);

    await waitFor(() =>
      expect(screen.getByText('图表语法有误，已显示源码')).toBeInTheDocument()
    );
    expect(screen.getByText('not a diagram')).toBeInTheDocument();
  });
});
