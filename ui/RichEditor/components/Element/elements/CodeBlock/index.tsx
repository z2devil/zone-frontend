import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { autocompletion } from '@codemirror/autocomplete';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { CodeBlockElement } from 'types/slate';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly, useSelected, useSlate } from 'slate-react';
import { Language } from '@/ui/RichEditor/constans';

interface CodeBlockProps {
  attributes: any;
  children: any;
  element: CodeBlockElement;
}

const SUPPORTED_LANGUAGES = [
  Language.PLAINTEXT,
  Language.JAVASCRIPT,
  Language.TYPESCRIPT,
  Language.HTML,
  Language.CSS,
  Language.JSON,
  Language.MARKDOWN,
  Language.PYTHON,
  Language.JAVA,
  Language.PHP,
  Language.RUBY,
  Language.C,
  Language.CPP,
  Language.CSHARP,
  Language.GO,
  Language.RUST,
  Language.SQL,
  Language.SHELL,
  Language.BASH,
  Language.DOCKER,
  Language.NGINX,
  Language.YAML,
  Language.XML,
  Language.LESS,
  Language.SCSS,
];

const CodeBlock = ({ attributes, children, element }: CodeBlockProps) => {
  const editor = useSlate();

  const readOnly = useReadOnly();

  const selected = useSelected();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);

  /************************************************
   * ✨ 语言
   ************************************************/

  const [language, setLanguage] = useState<Language>(
    element.language || Language.PLAINTEXT
  );

  const [isLanguageEditing, setIsLanguageEditing] = useState(false);

  // 开始切换语言编辑
  const handleLanguageEdit = useCallback(
    (editing: boolean) => {
      if (readOnly) return;
      setIsLanguageEditing(editing);
    },
    [readOnly]
  );

  // 切换语言
  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      if (SUPPORTED_LANGUAGES.includes(value as Language)) {
        setLanguage(value as Language);
        handleLanguageEdit(false);
      }
    },
    [handleLanguageEdit]
  );

  /************************************************
   * ✨ 代码编辑器
   ************************************************/

  const viewRef = useRef<EditorView | null>(null);

  const [content, setContent] = useState(element.content || '');

  const [contentHeight, setContentHeight] = useState(0);

  const [height, setHeight] = useState(element.height || 100);

  const [customHeight, setCustomHeight] = useState(false);

  // 切换高度模式
  const handleToggleCustomHeight = useCallback(() => {
    setCustomHeight(!customHeight);
  }, [customHeight]);

  // 自动高度
  useEffect(() => {
    if (readOnly) return;
    if (customHeight) return;
    setHeight(contentHeight);
  }, [customHeight, contentHeight, readOnly]);

  // 更新内容
  useEffect(() => {
    const path = ReactEditor.findPath(editor, element);
    const nextElement = {
      language,
      content,
      height,
    } as CodeBlockElement;
    Transforms.setNodes(editor, nextElement, {
      at: path,
    });
  }, [element, editor, content, height, language]);

  const readOnlyMode = useMemo(
    () => EditorView.editable.of(!readOnly),
    [readOnly]
  );

  const onUpdate = useMemo(
    () =>
      EditorView.updateListener.of(update => {
        setContent(update.state.doc.toString());
        setContentHeight(update.view.contentHeight);
      }),
    []
  );

  const autoCompletion = useMemo(
    () =>
      autocompletion({
        activateOnTyping: false,
      }),
    []
  );

  const theme = useMemo(
    () =>
      EditorView.theme({
        '&': {
          // color: 'white',
          // backgroundColor: '#034',
          // height: '100%',
        },
        // '.cm-content': {
        //   caretColor: '#0e9',
        // },
        '&.cm-focused': {
          outline: 'none',
        },
        // '&.cm-focused .cm-cursor': {
        //   borderLeftColor: '#0e9',
        // },
        // '&.cm-focused .cm-selectionBackground, ::selection': {
        //   backgroundColor: '#074',
        // },
        '.cm-gutters': {
          backgroundColor: '#efefed',
          // color: '#ddd',
          // border: 'none',
        },
        '.cm-scroller': {
          'overflow-x': 'unset',
        },
      }),
    []
  );

  useEffect(() => {
    const containerDOM = containerRef.current;
    const editorDOM = editorRef.current;
    if (!editorDOM || !containerDOM) throw new Error('editor DOM is null');

    /**
     * bugfix:
     * 用于解决 codeMirror 无法输入内容，却能删除和粘贴内容的问题
     */
    const shadowRoot = editorDOM.attachShadow({ mode: 'open' });

    viewRef.current = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          keymap.of([...defaultKeymap, indentWithTab]),
          readOnlyMode,
          onUpdate,
          theme,
          autoCompletion,
          javascript(),
        ],
      }),
      parent: shadowRoot,
      root: shadowRoot,
    });

    return () => {
      viewRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /************************************************
   * ✨ 编辑器尺寸
   ************************************************/

  const [isResizing, setIsResizing] = useState(false);

  // 开始拖拽
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!customHeight) return;
      setIsResizing(true);
    },
    [customHeight]
  );

  // 拖拽
  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const containerDOM = containerRef.current;
        if (!containerDOM) return;
        const { top } = containerDOM.getBoundingClientRect();
        const nextHeight = e.clientY - top;
        setHeight(nextHeight);
      });
    };
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', () => {
        setIsResizing(false);
      });
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', () => {
        setIsResizing(false);
      });
    };
  }, [isResizing]);

  return (
    <>
      <div className=' relative' {...attributes} contentEditable={false}>
        <div
          className={clsx(
            ' my-2 flex flex-col overflow-hidden rounded-md border bg-gray-200 text-black-600',
            !readOnly && selected ? 'border-[#2f8ef4]' : 'border-black-50'
          )}>
          <div className=' w-full'>
            <div
              ref={toolbarRef}
              className=' sticky top-0 z-10 flex items-center justify-between rounded-sm border-b border-black-50 bg-gray-50 px-4 py-2'>
              <div>
                {isLanguageEditing ? (
                  <select
                    className='bg-transparent text-black-600'
                    value={language}
                    autoFocus
                    onChange={handleLanguageChange}
                    onBlur={() => handleLanguageEdit(false)}>
                    {SUPPORTED_LANGUAGES.map(language => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span onClick={() => handleLanguageEdit(true)}>
                    {language}
                  </span>
                )}
              </div>
              {!readOnly ? (
                <div>
                  <button onClick={handleToggleCustomHeight}>
                    <span
                      className={clsx(
                        ' text-xs',
                        customHeight ? 'text-green-500' : 'text-blue-500'
                      )}>
                      {customHeight ? '手动高度' : '自动高度'}
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
            <div
              ref={containerRef}
              className=' relative overflow-auto'
              style={{
                height: `${height}px`,
              }}>
              <div ref={editorRef}></div>
            </div>
            <div
              style={{
                fontSize: '0',
              }}>
              {children}
            </div>
          </div>
        </div>
        {!readOnly && selected && customHeight ? (
          <div
            className=' absolute bottom-0 left-1/2 box-content h-2 w-14 -translate-x-1/2 translate-y-1/2 cursor-row-resize rounded-md border border-black-300 bg-gray-200'
            onContextMenu={handleResizeStart}
            onMouseDown={handleResizeStart}></div>
        ) : null}
      </div>
    </>
  );
};

export default CodeBlock;
