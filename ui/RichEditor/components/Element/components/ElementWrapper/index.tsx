import { useCallback } from 'react';
import { CustomElement } from 'types/slate';
import { useSlate } from 'slate-react';

interface BlockElementControllerProps {
  id: string;
  children: any;
  element: CustomElement;
}

const ElementWrapper = (props: BlockElementControllerProps) => {
  const { children, element } = props;

  const editor = useSlate();

  const handleElementClick = useCallback(() => {
    console.log('[ handleElementClick ]', element);
    editor.onElementClick?.(element);
  }, [editor, element]);

  return <span onClick={handleElementClick}>{children}</span>;
};

export default ElementWrapper;
