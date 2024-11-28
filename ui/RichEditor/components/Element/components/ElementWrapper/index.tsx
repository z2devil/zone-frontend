import { useCallback } from 'react';
import { CustomElement } from 'types/slate';
import { useSlate } from 'slate-react';
import React from 'react';

interface BlockElementControllerProps {
  id: string;
  children: React.ReactElement;
  element: CustomElement;
}

const ElementWrapper = (props: BlockElementControllerProps) => {
  const { children, element } = props;

  const editor = useSlate();

  const handleElementClick = useCallback(() => {
    editor.onElementClick?.(element);
  }, [editor, element]);

  return <span onClick={handleElementClick}>{children}</span>;
};

export default ElementWrapper;
