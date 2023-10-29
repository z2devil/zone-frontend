import { useCallback, useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import {
  Slate as SlateProvider,
  Editable,
  RenderElementProps,
  RenderLeafProps,
  withReact,
} from 'slate-react';
import Leaf from '../../../Leaf';
import Element from '../..';
import clsx from 'clsx';
import { ElementType } from '@/ui/CustomEditor/constans';

interface CodeBlockProps {
  attributes: any;
  children: any;
  element: any;
}

const DEFAULT_CONTENT: Descendant[] = [
  {
    type: ElementType.PARAGRAPH,
    children: [
      {
        type: ElementType.TEXT,
        text: '',
      },
    ],
  },
];

const CodeBlock = ({ attributes, children, element }: CodeBlockProps) => {
  const language = element.language || 'javascript';

  const editor = useMemo(() => {
    return withReact(createEditor());
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );

  const isFocused = useMemo(() => {
    return element.id === 'focused';
  }, [element.id]);

  return (
    <>
      <div
        {...attributes}
        className={clsx(
          ' my-2 flex flex-col gap-1 rounded-md border border-black-50 bg-gray-200 text-black-600',
          isFocused && 'border-[#2f8ef4]'
        )}
        contentEditable={false}>
        <div className=' border-b border-black-50 px-4 py-2'>
          <span>{language}</span>
        </div>
        <SlateProvider editor={editor} initialValue={DEFAULT_CONTENT}>
          <Editable
            className={clsx(
              ' flex h-full w-full flex-col overflow-y-auto p-4 outline-none',
              `language-${language}`
            )}
            tabIndex={0}
            spellCheck={false}
            renderLeaf={renderLeaf}
            renderElement={renderElement}
          />
        </SlateProvider>
        {children}
      </div>
    </>
  );
};

export default CodeBlock;
