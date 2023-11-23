import { useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import clsx from 'clsx';
import Editor from '../RichEditor/components/Editor';

interface EditorProps {
  className?: string;
  initialValue: Descendant[];
}

const RichView = (props: EditorProps) => {
  const { className, initialValue } = props;

  const editor = useMemo(() => {
    const enhancers = [withReact];
    return enhancers.reduce(
      (editor, enhancer) => enhancer(editor),
      createEditor()
    );
  }, []);

  return (
    <div
      className={clsx(
        ' relative flex flex-1 flex-col overflow-hidden',
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
