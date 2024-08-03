import { useEffect, useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import clsx from 'clsx';
import Editor from '../RichEditor/components/Editor';
import { BlockElementType } from '../RichEditor/constants';

interface EditorProps {
  className?: string;
  value: Descendant[];
  initialValue?: Descendant[];
  isSummary?: boolean;
}

const RichView = (props: EditorProps) => {
  const {
    className,
    value,
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
    isSummary,
  } = props;

  const editor = useMemo(() => {
    const enhancers = [withReact];
    const res = enhancers.reduce((e, enhancer) => enhancer(e), createEditor());
    if (isSummary) {
      res.isSummary = true;
    }
    return res;
  }, [isSummary]);

  useEffect(() => {
    if (value) {
      editor.children = value;
    }
  }, [value, initialValue, editor]);

  return (
    <div
      className={clsx(
        'relative flex flex-1 flex-col overflow-hidden',
        className
      )}>
      <SlateProvider editor={editor} initialValue={initialValue}>
        <Editor readonly />
      </SlateProvider>
    </div>
  );
};

RichView.displayName = 'RichView';

export default RichView;
