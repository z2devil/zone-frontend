import { useCallback, useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import {
  Slate as SlateProvider,
  Editable,
  RenderElementProps,
  RenderLeafProps,
  withReact,
} from 'slate-react';
import Leaf from '../RichEditor/components/Leaf';
import Element from '../RichEditor/components/Element';
import clsx from 'clsx';
import style from '../RichEditor/style.module.scss';

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

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );

  return (
    <div
      className={clsx(
        ' relative flex flex-1 flex-col overflow-hidden',
        className
      )}>
      <SlateProvider editor={editor} initialValue={initialValue}>
        <Editable
          className={clsx(
            style.editor,
            ' h-full w-full overflow-y-auto text-black-900 outline-none'
          )}
          spellCheck={false}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          readOnly
        />
      </SlateProvider>
    </div>
  );
};

RichView.displayName = 'RichView';

export default RichView;
