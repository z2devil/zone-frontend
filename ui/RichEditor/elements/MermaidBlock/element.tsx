import clsx from 'clsx';
import { useMemo } from 'react';
import { MermaidBlockElement } from 'types/slate';
import { Node } from 'slate';
import { useReadOnly, useSelected, useSlate } from 'slate-react';
import HiddenPlaceholder from '@/ui/RichEditor/components/HiddenPlaceholder';
import MermaidDiagram from './components/Diagram';
import { getMermaidViewMode } from './viewMode';

interface MermaidBlockProps {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  element: MermaidBlockElement;
}

const MermaidBlock = ({ attributes, children, element }: MermaidBlockProps) => {
  const editor = useSlate();
  const readOnly = useReadOnly();
  const selected = useSelected();
  const source = useMemo(
    () => element.children.map(line => Node.string(line)).join('\n'),
    [element.children]
  );
  const mode = getMermaidViewMode({
    readOnly,
    summary: Boolean(editor.isSummary),
  });

  if (mode === 'source') {
    return (
      <div
        {...attributes}
        className={clsx(
          'relative my-2 flex flex-col overflow-hidden rounded-md bg-black-50 text-black-600 ring-1 ring-inset',
          selected ? 'ring-primary' : 'ring-transparent'
        )}>
        <div
          className='select-none border-b border-black-50 px-4 py-2 text-sm'
          contentEditable={false}>
          Mermaid
        </div>
        <pre className='scrollbar overflow-x-auto p-4 font-mono'>
          <code>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      {...attributes}
      className='my-2 overflow-hidden rounded-md bg-black-50 text-black-600'
      contentEditable={false}>
      {mode === 'diagram' ? (
        <MermaidDiagram source={source} />
      ) : (
        <div className='flex min-h-24 items-center justify-center text-sm text-black-300'>
          Mermaid 图表
        </div>
      )}
      <HiddenPlaceholder>{children}</HiddenPlaceholder>
    </div>
  );
};

export default MermaidBlock;
