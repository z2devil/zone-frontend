'use client';

import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import Toolbar from './components/Toolbar';
import { withShortcuts } from './utils';
import { withHistory } from 'slate-history';
import { withInlines } from './utils/withInlines';
import { BlockElementType } from './constans';
import { withVoids } from './utils/withVoids';
import Editor from './components/Editor';

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
        <Editor className='p-6' />
      </SlateProvider>
    </div>
  );
};

export default RichEditor;
