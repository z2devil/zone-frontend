import { useMemo } from 'react';
import { TipBlockElement } from 'types/slate';

interface TipPreviewProps {
  element: TipBlockElement;
  children?: any;
}

const TipPreview = (props: TipPreviewProps) => {
  const { element, children } = props;

  const icon = useMemo(() => element.icon, [element.icon]);

  return (
    <>
      <div className='flex h-7 w-7 cursor-pointer items-center justify-center'>
        <span className='text-xl'>{icon ?? '😀'}</span>
      </div>
      <div className='w-full'>{children}</div>
    </>
  );
};

export default TipPreview;
