import { useCallback } from 'react';
import { CustomElement } from 'types/slate';
import { useSlate } from 'slate-react';
import React from 'react';

interface BlockElementControllerProps {
  id: string;
  children: React.ReactElement; // 确保 children 是单个元素
  element: CustomElement;
}

const ElementWrapper = (props: BlockElementControllerProps) => {
  const { children, element } = props;

  const editor = useSlate();

  const handleElementClick = useCallback(() => {
    editor.onElementClick?.(element);
  }, [editor, element]);

  return React.cloneElement(children, {
    onClick: handleElementClick,
  });
};

export default ElementWrapper;
