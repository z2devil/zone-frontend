import { useReadOnly, useSelected } from 'slate-react';
import { TipBlockElement } from 'types/slate';
import TipPreview from './components/Preview';
import TipEdit from './components/Edit';
import clsx from 'clsx';

interface TipBlockProps {
  attributes: any;
  children: any;
  element: TipBlockElement;
}

const TipBlock = ({ attributes, children, element }: TipBlockProps) => {
  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <div {...attributes}>
      <div
        className={clsx(
          'mb-2 flex min-h-6 gap-2 overflow-hidden rounded-lg bg-gray-50 p-2',
          {
            border: !readOnly,
            'border-primary-50': !readOnly && selected,
            'border-transparent': readOnly || (!readOnly && !selected),
            'hover:border-gray-300': !readOnly && !selected,
          }
        )}>
        {readOnly ? (
          <TipPreview element={element}>{children}</TipPreview>
        ) : (
          <TipEdit element={element}>{children}</TipEdit>
        )}
      </div>
    </div>
  );
};

export default TipBlock;
