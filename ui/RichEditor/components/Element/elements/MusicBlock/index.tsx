import { useReadOnly, useSelected } from 'slate-react';
import { MusicBlockElement } from 'types/slate';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import MusicPreview from './components/Preview';
import MusicEdit from './components/Edit';
import clsx from 'clsx';

dayjs.extend(duration);

interface MusicBlockProps {
  attributes: any;
  children: any;
  element: MusicBlockElement;
}

const MusicBlock = ({ attributes, children, element }: MusicBlockProps) => {
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
          <MusicPreview element={element} />
        ) : (
          <MusicEdit element={element} />
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

export default MusicBlock;
