import { useReadOnly } from 'slate-react';
import { ImageBlockElement } from 'types/slate';
import ImageEdit from './components/Edit';
import ImagePreview from './components/Preview';
import { useMemo, useRef } from 'react';

interface ImageBlockProps {
  attributes: any;
  children: any;
  element: ImageBlockElement;
}

const ImageBlock = ({ attributes, children, element }: ImageBlockProps) => {
  const readOnly = useReadOnly();

  const ref = useRef<HTMLDivElement>(null);

  const styles = useMemo(() => {
    const res: React.CSSProperties = {};
    res.justifyContent = element.align || 'center';
    return res;
  }, [element.align]);

  return (
    <div {...attributes} className='my-2' contentEditable={false}>
      <div className='flex' ref={ref} style={styles}>
        {readOnly ? (
          <ImagePreview element={element} />
        ) : (
          <ImageEdit containerRef={ref} element={element} />
        )}
      </div>
      <div
        style={{
          fontSize: 0,
          height: 0,
        }}>
        {children}
      </div>
    </div>
  );
};

export default ImageBlock;
