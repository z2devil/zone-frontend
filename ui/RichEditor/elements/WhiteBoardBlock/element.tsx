import clsx from 'clsx';
import { WhiteBoardBlockElement } from 'types/slate';
import { useReadOnly, useSelected } from 'slate-react';
import WhiteBoard from './components/WhiteBoard/WhiteBoard';
import HiddenPlaceholder from '@/ui/RichEditor/components/HiddenPlaceholder';

interface WhiteBoardBlockProps {
  attributes: any;
  children: any;
  element: WhiteBoardBlockElement;
}

const WhiteBoardBlock = ({
  attributes,
  children,
  element,
}: WhiteBoardBlockProps) => {
  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <div className='relative mb-2' {...attributes} contentEditable={false}>
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
        <WhiteBoard element={element} readOnly={readOnly} />
      </div>
      <HiddenPlaceholder>{children}</HiddenPlaceholder>
    </div>
  );
};

export default WhiteBoardBlock;
