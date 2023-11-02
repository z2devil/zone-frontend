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
import useDOMBeforeInput from './hooks/useDOMBeforeInput';
import useKeyDown from './hooks/useKeyDown';
import { withInlines } from './utils/withInlines';
import { BlockElementType, InlineElementType, Language } from './constans';
import { withVoids } from './utils/withVoids';
import style from './style.module.scss';

interface EditorProps {
  className?: string;
  initialValue?: Descendant[];
}

export interface EditorRef {
  getHTML: () => string;
  getJSON: () => Descendant[];
}

const text: Descendant[] = [
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '什么是 Fiber ？',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '对于 React 来说，Fiber 可以从两个角度进行理解：',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: BlockElementType.CODE_BLOCK,
    children: [
      {
        text: '',
      },
    ],
    language: Language.JAVASCRIPT,
    content:
      'const a = 1;\nfunction log(params) {\n  console.log(params)\n};\nlog();',
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: BlockElementType.HEADING_2,
    children: [
      {
        text: '一种流程控制原语',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: BlockElementType.BLOCK_QUOTE,
    children: [
      {
        text: '所谓原语，一般是指由若干条指令组成的程序段，用来实现某个特定功能，在执行过程中不可被中断。',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: 'Fiber 也称',
      },
      {
        text: '协程',
        bold: true,
      },
      {
        text: '，或者纤程。Ruby 中就将协程叫做 Fiber ，ES6 中的',
      },
      {
        type: InlineElementType.CODE_LINE,
        children: [
          {
            text: 'Generaror',
          },
        ],
      },
      {
        text: '也是一类东西。',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '协程是一种流程控制的让出机制',
        bold: true,
        underline: true,
      },
      {
        text: '，和线程不一样。',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: 'React Fiber 的思想和协程的概念是契合的：',
      },
      {
        text: 'React 渲染过程可以被中断，将控制权交回浏览器，或是让给更高优先级的任务，等待浏览器空闲后再继续渲染。',
        bold: true,
        underline: true,
      },
    ],
  },
];

const RichEditor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  const {
    className,
    initialValue = text,
    // [
    //   {
    //     type: BlockElementType.PARAGRAPH,
    //     children: [
    //       {
    //         text: '',
    //       },
    //     ],
    //   },
    // ],
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
          // onDOMBeforeInput={handleDOMInput}
          onKeyDown={handleKeyDown}
        />
      </SlateProvider>
    </div>
  );
});

RichEditor.displayName = 'RichEditor';

export default RichEditor;
