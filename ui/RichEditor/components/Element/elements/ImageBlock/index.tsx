import { useReadOnly } from 'slate-react';
import { ImageBlockElement } from 'types/slate';
import ImageEdit from './components/Edit';
import ImagePreview from './components/Preview';

interface CodeBlockProps {
  attributes: any;
  children: any;
  element: ImageBlockElement;
}

const ImageBlock = ({ attributes, children, element }: CodeBlockProps) => {
  const readOnly = useReadOnly();

  return (
    <div {...attributes} className='overflow-hidden' contentEditable={false}>
      {readOnly ? (
        <ImagePreview element={element} />
      ) : (
        <ImageEdit element={element} />
      )}
      {children}
    </div>
  );
};

export default ImageBlock;
