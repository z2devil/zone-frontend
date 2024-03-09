import { useReadOnly, useSelected } from 'slate-react';
import { CubeBlockElement } from 'types/slate';
import CubePreview from './components/Preview';
import CubeEdit from './components/Edit';
import clsx from 'clsx';

interface CubeBlockProps {
  attributes: any;
  children: any;
  element: CubeBlockElement;
}

const CubeBlock = ({ attributes, children, element }: CubeBlockProps) => {
  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <div {...attributes}>
      <div
        contentEditable={false}
        className={clsx(
          ' border-1 mb-2 flex overflow-hidden rounded-lg border bg-gray-50',
          !readOnly
            ? selected
              ? 'border-primary-50'
              : 'border-transparent'
            : ''
        )}>
        {readOnly ? (
          <CubePreview element={element} />
        ) : (
          <CubeEdit element={element} />
        )}
      </div>
      <div
        style={{
          fontSize: '0',
        }}>
        {children}
      </div>
    </div>
  );
};

export default CubeBlock;
