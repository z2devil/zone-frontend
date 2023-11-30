import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  useSlate,
} from 'slate-react';
import useCopy from '../../hooks/useCopy';
import useKeyDown from '../../hooks/useKeyDown';
import Element from '../Element';
import Leaf from '../Leaf';
import style from './style.module.scss';
import { useCallback } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import useCut from '../../hooks/useCut';

interface EditorProps {
  className?: string;
  readonly?: boolean;
}

const Editor = (props: EditorProps) => {
  const { className, readonly } = props;

  const editor = useSlate();

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );

  // const handleDOMInput = useDOMBeforeInput(editor);

  const handleKeyDown = useKeyDown(editor, readonly);

  const handleCopy = useCopy(editor);

  const handleCut = useCut(editor);

  return (
    <Editable
      className={clsx(
        style.editor,
        twMerge(
          ' h-full w-full overflow-y-auto text-black-900 outline-none',
          className
        )
      )}
      tabIndex={0}
      spellCheck={false}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      // onDOMBeforeInput={handleDOMInput}
      onKeyDown={handleKeyDown}
      onCopy={handleCopy}
      onCut={handleCut}
      readOnly={readonly}
      renderPlaceholder={props => (
        <div {...props} className={clsx(twMerge(' text-gray-400'))}>
          Type something...
        </div>
      )}
    />
  );
};

export default Editor;
