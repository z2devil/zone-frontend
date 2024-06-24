import clsx from 'clsx';
import { WhiteBoardBlockElement } from 'types/slate';
import { useReadOnly, useSelected, useSlate } from 'slate-react';
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
  const editor = useSlate();

  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <div className='relative mb-2' {...attributes}>
      <div
        className={clsx(
          'border-1 mb-2 flex aspect-[4/3] overflow-hidden rounded-lg border bg-gray-50',
          !readOnly
            ? selected
              ? 'border-primary-50'
              : 'border-transparent'
            : ''
        )}
        contentEditable={false}>
        <WhiteBoard element={element} readOnly={readOnly} />
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

export default WhiteBoardBlock;
