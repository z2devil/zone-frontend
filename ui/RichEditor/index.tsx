'use client';

import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import {
  Slate as SlateProvider,
  RenderElementProps,
  RenderLeafProps,
  withReact,
} from 'slate-react';
import { Editable } from 'slate-react';
import Toolbar from './components/Toolbar';
import { withShortcuts } from './utils';
import Element from './components/Element';
import { withHistory } from 'slate-history';
import Leaf from './components/Leaf';
import useDOMBeforeInput from './hooks/useDOMBeforeInput';
import useKeyDown from './hooks/useKeyDown';
import { withInlines } from './utils/withInlines';
import { BlockElementType, InlineElementType, Language } from './constans';
import { withVoids } from './utils/withVoids';
import style from './style.module.scss';

interface EditorProps {
  className?: string;
  initialValue?: Descendant[];
  onChange?: (value: Descendant[]) => void;
}
const RichEditor = (props: EditorProps) => {
  const {
    className,
    initialValue = [
      {
        type: BlockElementType.PARAGRAPH,
        children: [
          {
            text: '',
          },
        ],
      },
    ],
    onChange,
  } = props;

  const editor = useMemo(() => {
    const enhancers = [
      withReact,
      withHistory,
      withInlines,
      withVoids,
      withShortcuts,
    ];
    return enhancers.reduce(
      (editor, enhancer) => enhancer(editor),
      createEditor()
    );
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );

  // const handleDOMInput = useDOMBeforeInput(editor);

  const handleKeyDown = useKeyDown(editor);

  const handleContentChange = useCallback(
    (value: Descendant[]) => {
      onChange?.(value);
    },
    [onChange]
  );

  return (
    <div
      className={clsx(
        ' relative flex flex-1 flex-col overflow-hidden',
        className
      )}>
      <Toolbar editor={editor} />
      <SlateProvider
        editor={editor}
        initialValue={initialValue}
        onChange={handleContentChange}>
        <Editable
          className={clsx(
            style.editor,
            ' h-full w-full overflow-y-auto p-6 text-black-900 outline-none'
          )}
          tabIndex={0}
          spellCheck={false}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          // onDOMBeforeInput={handleDOMInput}
          onKeyDown={handleKeyDown}
        />
      </SlateProvider>
    </div>
  );
};

export default RichEditor;
