import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { CodeBlockElement } from 'types/slate';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { Language } from '@/ui/CustomEditor/constans';

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

  const editorRef = useRef<HTMLDivElement | null>(null);

  /************************************************
   * ✨ 语言
   ************************************************/

  const [language, setLanguage] = useState<Language>(
    element.language || Language.PLAINTEXT
  );

  const [isLanguageEditing, setIsLanguageEditing] = useState(false);

  const handleLanguageEdit = useCallback((editing: boolean) => {
    setIsLanguageEditing(editing);
  }, []);

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
   * ✨ 内容
   ************************************************/

  const [content, setContent] = useState(element.content || '');

  useEffect(() => {
    console.log('[ content ]', content);
    const path = ReactEditor.findPath(editor, element);
    const nextElement = {
      language,
      content,
    };
    Transforms.setNodes(editor, nextElement, {
      at: path,
    });
  }, [content, editor, element, language]);

  const onUpdate = useMemo(
    () =>
      EditorView.updateListener.of(update => {
        setContent(update.state.doc.toString());
      }),
    []
  );

  const theme = useMemo(
    () =>
      EditorView.theme({
        // '&': {
        //   color: 'white',
        //   backgroundColor: '#034',
        // },
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
          backgroundColor: 'transparent',
          // color: '#ddd',
          // border: 'none',
        },
      }),
    []
  );

  useEffect(() => {
    const editorDOM = editorRef.current;
    if (!editorDOM) throw new Error('editor DOM is null');

    /**
     * bugfix:
     * 用于解决 codeMirror 无法输入内容，却能删除和粘贴内容的问题
     */
    const shadowRoot = editorDOM.attachShadow({ mode: 'open' });

    console.log('[ editorDOM.shadowRoot ]', editorDOM.shadowRoot);

    const view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          keymap.of([...defaultKeymap, indentWithTab]),
          javascript(),
          onUpdate,
          theme,
        ],
      }),
      parent: shadowRoot,
      root: shadowRoot,
    });

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        {...attributes}
        className={clsx(
          ' my-2 flex flex-col rounded-md border border-black-50 bg-gray-200 text-black-600',
          element && 'border-[#2f8ef4]'
        )}
        contentEditable={false}>
        <div
          className=' border-b border-black-50 px-4 py-2'
          onClick={() => handleLanguageEdit(true)}>
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
            <span>{language}</span>
          )}
        </div>
        <div ref={editorRef}></div>
        {children}
      </div>
    </>
  );
};

export default CodeBlock;
