import { useReadOnly, useSelected } from 'slate-react';
import { MusicBlockElement } from 'types/slate';
import MusicPreview from './components/Preview';
import MusicEdit from './components/Edit';
import clsx from 'clsx';

interface MusicBlockProps {
  attributes: any;
  children: any;
  element: MusicBlockElement;
}

const MusicBlock = ({ attributes, children, element }: MusicBlockProps) => {
  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <div {...attributes} contentEditable={false}>
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
          <MusicPreview element={element} />
        ) : (
          <MusicEdit element={element} />
        )}
      </div>
      {children}
    </div>
  );
};

export default MusicBlock;
