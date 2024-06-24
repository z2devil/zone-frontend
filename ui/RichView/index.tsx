import { useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import clsx from 'clsx';
import Editor from '../RichEditor/components/Editor';

interface EditorProps {
  className?: string;
  initialValue: Descendant[];
  isSummary?: boolean;
}

const RichView = (props: EditorProps) => {
  const { className, initialValue, isSummary } = props;

  const editor = useMemo(() => {
    const enhancers = [withReact];
    const res = enhancers.reduce((e, enhancer) => enhancer(e), createEditor());
    if (isSummary) {
      res.isSummary = true;
    }
    return res;
  }, [isSummary]);

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
