'use client';

import clsx from 'clsx';
import { KeyboardEvent, useCallback, useMemo } from 'react';
import {
  Element as SlateElement,
  Descendant,
  Editor,
  Node,
  createEditor,
} from 'slate';
import {
  Slate as SlateProvider,
  ReactEditor,
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
import { SHORTCUTS } from './constans';
import { ElementType } from 'types';
import style from './style.module.scss';

interface EditorProps {
  className?: string;
}

const CustomEditor = (props: EditorProps) => {
  const { className } = props;

  const editor = useMemo(() => {
    return withShortcuts(withHistory(withReact(createEditor())));
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    console.log('[ handleKeyDown ]', e);
  }, []);

  const handleDOMBeforeInput = useCallback(
    (e: InputEvent) => {
      queueMicrotask(() => {
        const pendingDiffs = ReactEditor.androidPendingDiffs(editor);

        const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
          if (!diff.text.endsWith(' ')) {
            return false;
          }

          const { text } = Node.leaf(editor, path);
          const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1);
          if (!(beforeText in SHORTCUTS)) {
            return;
          }

          const blockEntry = Editor.above(editor, {
            at: path,
            match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
          });
          if (!blockEntry) {
            return false;
          }

          const [, blockPath] = blockEntry;
          return Editor.isStart(editor, Editor.start(editor, path), blockPath);
        });

        if (scheduleFlush) {
          ReactEditor.androidScheduleFlush(editor);
        }
      });
    },
    [editor]
  );

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
            ' h-full w-full overflow-y-auto p-6 outline-none'
          )}
          placeholder='Write some markdown...'
          tabIndex={0}
          spellCheck={false}
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          onKeyDown={handleKeyDown}
          onDOMBeforeInput={handleDOMBeforeInput}
        />
      </SlateProvider>
    </div>
  );
};

export default CustomEditor;

const initialValue: Descendant[] = [
  {
    type: ElementType.PARAGRAPH,
    children: [
      {
        type: ElementType.TEXT,
        text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: ElementType.BLOCK_QUOTE,
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: ElementType.PARAGRAPH,
    children: [
      {
        type: ElementType.TEXT,
        text: 'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: ElementType.HEADING_2,
    children: [
      {
        type: ElementType.TEXT,
        text: 'Try it out!',
      },
    ],
  },
  {
    type: ElementType.PARAGRAPH,
    children: [
      {
        type: ElementType.TEXT,
        text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
];
