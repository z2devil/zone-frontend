'use client';

import clsx from 'clsx';
import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { Descendant, Node, createEditor } from 'slate';
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
import style from './style.module.scss';
import useDOMBeforeInput from './hooks/useDOMBeforeInput';
import useKeyDown from './hooks/useKeyDown';
import { withInlines } from './utils/withInlines';
import { BlockElementType } from './constans';

interface EditorProps {
  className?: string;
  initialValue?: Descendant[];
}

export interface EditorRef {
  getHTML: () => string;
  getJSON: () => Descendant[];
}

const CustomEditor = forwardRef<EditorRef, EditorProps>((props, ref) => {
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
  } = props;

  const editor = useMemo(() => {
    const enhancers = [withReact, withHistory, withInlines, withShortcuts];
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

  const handleDOMInput = useDOMBeforeInput(editor);

  const handleKeyDown = useKeyDown(editor);

  useImperativeHandle(ref, () => {
    return {
      getHTML: () => {
        return editor.children.map(node => Node.string(node)).join('\n');
      },
      getJSON: () => {
        return editor.children;
      },
    };
  });

  return (
    <div
      className={clsx(
        ' relative flex flex-1 flex-col overflow-hidden',
        className
      )}>
      <Toolbar editor={editor} />
      <SlateProvider editor={editor} initialValue={initialValue}>
        <Editable
          className={clsx(
            style.editor,
            ' h-full w-full overflow-y-auto p-6 text-black-900 outline-none'
          )}
          tabIndex={0}
          spellCheck={false}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onDOMBeforeInput={handleDOMInput}
          onKeyDown={handleKeyDown}
        />
      </SlateProvider>
    </div>
  );
});

CustomEditor.displayName = 'CustomEditor';

export default CustomEditor;
