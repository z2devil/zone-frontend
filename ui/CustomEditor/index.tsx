'use client';

import clsx from 'clsx';
import {
  KeyboardEvent,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
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
        type: ElementType.PARAGRAPH,
        children: [
          {
            type: ElementType.TEXT,
            text: '',
          },
        ],
      },
    ],
  } = props;

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
          placeholder='请输入内容...'
          renderPlaceholder={props => (
            <div
              className='pointer-events-none absolute select-none text-black-400'
              {...props.attributes}
              style={undefined}>
              {props.children}
            </div>
          )}
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          onKeyDown={handleKeyDown}
          onDOMBeforeInput={handleDOMBeforeInput}
        />
      </SlateProvider>
    </div>
  );
});

CustomEditor.displayName = 'CustomEditor';

export default CustomEditor;
