import { beforeEach, describe, expect, it, vi } from 'vitest';

const initialize = vi.fn();
const render = vi.fn();

vi.mock('mermaid', () => ({
  default: { initialize, render },
}));

describe('mermaidRuntime', () => {
  beforeEach(() => {
    vi.resetModules();
    initialize.mockReset();
    render.mockReset();
  });

  it('loads Mermaid once with a strict, bounded configuration', async () => {
    render.mockResolvedValue({ svg: '<svg>diagram</svg>' });
    const { renderMermaid } = await import('./mermaidRuntime');

    await expect(renderMermaid('diagram-1', 'flowchart TD')).resolves.toBe(
      '<svg>diagram</svg>'
    );
    await renderMermaid('diagram-2', 'sequenceDiagram');

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        maxEdges: 500,
        maxTextSize: 20_000,
        securityLevel: 'strict',
        startOnLoad: false,
        suppressErrorRendering: true,
      })
    );
    expect(render).toHaveBeenCalledWith('diagram-1', 'flowchart TD');
  });
});
