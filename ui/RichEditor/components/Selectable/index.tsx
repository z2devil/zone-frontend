import { cloneElement, useCallback, useMemo } from 'react';
import { useSlate } from 'slate-react';
import { Element, Editor, Path, Transforms } from 'slate';

interface SelectableProps {
  path: Path;
  element: Element;
  children: any;
}

const Selectable = (props: SelectableProps) => {
  const { path, element, children } = props;

  const editor = useSlate();

  const isVoid = useMemo(
    () => Editor.isVoid(editor, element),
    [editor, element]
  );

  const handleClick = useCallback(() => {
    if (!isVoid) return;
    Transforms.select(editor, path);
  }, [editor, path, isVoid]);

  if (!isVoid) return children;

  return cloneElement(children, {
    onClick: handleClick,
    ...children.props,
  });
};

export default Selectable;
