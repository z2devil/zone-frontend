import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  useSlate,
} from 'slate-react';
import style from './style.module.scss';
import { useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import Leaf from '@/ui/RichEditor/components/Leaf';
import Element from './components/Element';
import { useDecorate, useKeyDown, useCopy, useCut, useHotKeys } from './hooks';

interface EditorProps {
  className?: string;
  readonly?: boolean;
}

const RichEditor = (props: EditorProps) => {
  const { className, readonly } = props;

  const editor = useSlate();

  const isSummary = useMemo(() => editor.isSummary, [editor.isSummary]);

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );

  useHotKeys();

  // const handleDOMInput = useDOMBeforeInput(editor);

  const handleKeyDown = useKeyDown(editor, readonly);

  const handleCopy = useCopy(editor);

  const handleCut = useCut(editor);

  const decorate = useDecorate(editor);

  // 返回 true 将跳过 slate 的默认行为
  // 返回 false 将在自定义逻辑后执行 slate 的默认行为
  const onDrop = useCallback(() => {
    return true;
  }, []);

  const onDragStart = useCallback(() => {
    return true;
  }, []);

  return (
    <Editable
      className={clsx(
        style.editor,
        {
          [style.summary]: isSummary,
        },
        twMerge(
          'h-full w-full overflow-y-auto text-black-900 outline-none',
          className
        )
      )}
      decorate={decorate}
      readOnly={readonly}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      spellCheck={false}
      tabIndex={0}
      onCopy={handleCopy}
      onCut={handleCut}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onKeyDown={handleKeyDown}
    />
  );
};

export default RichEditor;
