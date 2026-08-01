import type { Mermaid } from 'mermaid';

let mermaidPromise: Promise<Mermaid> | undefined;

const loadMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        maxEdges: 500,
        maxTextSize: 20_000,
        securityLevel: 'strict',
        startOnLoad: false,
        suppressErrorRendering: true,
        theme: 'neutral',
      });
      return mermaid;
    });
  }

  return mermaidPromise;
};

export const renderMermaid = async (id: string, source: string) => {
  const mermaid = await loadMermaid();
  const { svg } = await mermaid.render(id, source);
  return svg;
};
