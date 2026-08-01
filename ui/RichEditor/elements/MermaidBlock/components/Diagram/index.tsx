import { useEffect, useId, useState } from 'react';
import { renderMermaid } from '../../mermaidRuntime';

interface MermaidDiagramProps {
  source: string;
}

type RenderState =
  | { status: 'loading' }
  | { status: 'ready'; svg: string }
  | { status: 'error' };

const MermaidDiagram = ({ source }: MermaidDiagramProps) => {
  const reactId = useId();
  const [state, setState] = useState<RenderState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    setState({ status: 'loading' });

    if (!source.trim()) {
      setState({ status: 'error' });
      return () => {
        active = false;
      };
    }

    const render = async () => {
      try {
        const svg = await renderMermaid(id, source);
        if (active) {
          setState(svg.trim() ? { status: 'ready', svg } : { status: 'error' });
        }
      } catch {
        if (active) setState({ status: 'error' });
      }
    };

    void render();

    return () => {
      active = false;
    };
  }, [reactId, source]);

  if (state.status === 'ready') {
    return (
      <div
        aria-label='Mermaid 图表'
        className='overflow-x-auto p-4 [&_svg]:mx-auto [&_svg]:max-w-full'
        dangerouslySetInnerHTML={{ __html: state.svg }}
        role='img'
      />
    );
  }

  if (state.status === 'error') {
    return (
      <div className='overflow-hidden'>
        <div className='border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-500'>
          图表语法有误，已显示源码
        </div>
        <pre className='scrollbar overflow-x-auto p-4 font-mono text-sm'>
          <code>{source}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className='flex min-h-32 items-center justify-center text-sm text-black-300'>
      正在渲染图表…
    </div>
  );
};

export default MermaidDiagram;
