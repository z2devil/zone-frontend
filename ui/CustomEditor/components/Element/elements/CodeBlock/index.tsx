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
import { ElementType } from 'types';

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
        text: 'const a = 1;',
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

  return (
    <>
      <div
        {...attributes}
        className=' flex flex-col gap-1 rounded-md border border-black-50 '
        contentEditable={false}>
        <div className=' border-b border-black-50 px-4 py-2'>
          <span>{language}</span>
        </div>
        <SlateProvider editor={editor} initialValue={DEFAULT_CONTENT}>
          <Editable
            className={clsx(
              ' flex h-full w-full flex-col overflow-y-auto border-b border-black-50 p-4 outline-none',
              `language-${language}`
            )}
            placeholder='Write some markdown...'
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
