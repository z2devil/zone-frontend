import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';
import { CodeBlockElement } from 'types/slate';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly, useSelected, useSlate } from 'slate-react';
import { Language } from '@/ui/RichEditor/constans';
import './style.css';

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
    <div className=' relative mb-2' {...attributes}>
      <div
        className={clsx(
          ' flex flex-col overflow-hidden rounded-md border bg-gray-200 text-black-600',
          !readOnly && selected ? 'border-[#2f8ef4]' : 'border-black-50'
        )}>
        <div
          ref={toolbarRef}
          className=' sticky top-0 z-10 flex select-none items-center justify-between rounded-sm border-b border-black-50 bg-gray-50 px-4 py-2'
          contentEditable={false}>
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
              <span onClick={() => handleLanguageEdit(true)}>{language}</span>
            )}
          </div>
        </div>
        <pre className='overflow-x-auto px-4 py-2'>
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
