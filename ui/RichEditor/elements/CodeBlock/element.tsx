import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';
import { CodeBlockElement } from 'types/slate';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly, useSelected, useSlate } from 'slate-react';
import './style.css';
import { Language } from '@/lib/constants';

interface CodeBlockProps {
  attributes: any;
  children: any;
  element: CodeBlockElement;
}

const SUPPORTED_LANGUAGES = [
  Language.PLAINTEXT,
  Language.JAVASCRIPT,
  Language.JSX,
  Language.TYPESCRIPT,
  Language.TSX,
  Language.MARKUP,
  Language.MARKDOWN,
  Language.CSS,
  Language.JSON,
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
  Language.BASH,
  Language.DOCKER,
  Language.NGINX,
  Language.YAML,
  Language.TOML,
  Language.LESS,
  Language.SCSS,
];

const CodeBlock = ({ attributes, children, element }: CodeBlockProps) => {
  const editor = useSlate();

  const readOnly = useReadOnly();

  const selected = useSelected();

  const toolbarRef = useRef<HTMLDivElement | null>(null);

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
        const path = ReactEditor.findPath(editor, element);
        Transforms.setNodes(
          editor,
          { language: value as Language },
          { at: path }
        );
      }
    },
    [editor, element, handleLanguageEdit]
  );

  return (
    <div
      {...attributes}
      className={clsx(
        'relative my-2 flex flex-col overflow-hidden rounded-md bg-black-50 text-black-600 ring-1 ring-inset',
        !readOnly && selected ? 'ring-primary' : 'ring-transparent'
      )}>
      <div
        className='relative flex select-none items-center justify-between rounded-sm border-b border-black-50 px-4 py-2'
        contentEditable={false}
        ref={toolbarRef}>
        <div>
          {isLanguageEditing ? (
            <select
              autoFocus
              className='bg-transparent text-black-600'
              value={language}
              onBlur={() => handleLanguageEdit(false)}
              onChange={handleLanguageChange}>
              {SUPPORTED_LANGUAGES.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          ) : (
            <span onClick={() => handleLanguageEdit(true)}>{language}</span>
          )}
        </div>
      </div>
      <pre className='scrollbar overflow-x-auto p-4 font-mono'>
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
