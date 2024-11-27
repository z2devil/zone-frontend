import clsx from 'clsx';
import { WhiteBoardBlockElement } from 'types/slate';
import { useReadOnly, useSelected } from 'slate-react';
import WhiteBoard from './components/WhiteBoard/WhiteBoard';

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
          'border-1 mb-2 flex aspect-[4/3] overflow-hidden rounded-lg border bg-gray-50',
          !readOnly
            ? selected
              ? 'border-primary-50'
              : 'border-transparent'
            : ''
        )}>
        <WhiteBoard element={element} readOnly={readOnly} />
      </div>
      {children}
    </div>
  );
};

export default WhiteBoardBlock;
