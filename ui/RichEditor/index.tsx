import React, { memo, useCallback, useMemo } from 'react';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  useSlate,
} from 'slate-react';
import style from './style.module.scss';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import Leaf from '@/ui/RichEditor/components/Leaf';
import Element from './components/Element';
import {
  useDecorate,
  useKeyDown,
  useCopy,
  useCut,
  useHotKeys,
  useAdditionalComponents,
} from './hooks';

interface EditorProps {
  className?: string;
  readonly?: boolean;
}

const RichEditor = memo((props: EditorProps) => {
  const { className, readonly } = props;

  const editor = useSlate();

  // TODO: 暂时不需要摘要模式
  // const isSummary = useMemo(() => editor.isSummary, [editor.isSummary]);

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );

  useHotKeys();

  // const handleDOMInput = useDOMBeforeInput(editor);

  const handleKeyDown = useKeyDown(editor, readonly);

  const handleCopy = useCopy(editor);

  const handleCut = useCut(editor);

  const decorate = useDecorate(editor);

  const additionalComponents = useAdditionalComponents();

  // 返回 true 将跳过 slate 的默认行为
  // 返回 false 将在自定义逻辑后执行 slate 的默认行为
  const onDrop = useCallback(() => {
    return true;
  }, []);

  const onDragStart = useCallback(() => {
    return true;
  }, []);

  const editable = useMemo(
    () => (
      <Editable
        className={clsx(
          style.editor,
          twMerge('h-full w-full text-black-900 outline-none', className)
        )}
        decorate={decorate}
        placeholder='请输入内容'
        readOnly={readonly}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        spellCheck={false}
        tabIndex={0}
        onCopy={handleCopy}
        onCut={handleCut}
        onDragStart={onDragStart}
        onDrop={onDrop}
        onKeyDown={handleKeyDown}
      />
    ),
    [
      className,
      decorate,
      readonly,
      renderElement,
      renderLeaf,
      handleCopy,
      handleCut,
      onDragStart,
      onDrop,
      handleKeyDown,
    ]
  );

  const additionalComponentsRender = useMemo(() => {
    let afterAdditional: React.ReactNode = null;
    let beforeAdditional: React.ReactNode = null;

    for (const {
      key,
      component: Component,
      position,
    } of additionalComponents) {
      if (!Component || !key) continue;

      if (position === 'before') {
        beforeAdditional = (
          <>
            <Component key={key} />
            {beforeAdditional}
          </>
        );
      } else if (position === 'after') {
        afterAdditional = (
          <>
            {afterAdditional}
            <Component key={key} />
          </>
        );
      }
    }

    let aboveEditable: React.ReactNode = (
      <>
        {beforeAdditional}
        {editable}
        {afterAdditional}
      </>
    );

    for (const {
      key,
      component: Component,
      position,
    } of additionalComponents) {
      if (position === 'above' && Component && key) {
        aboveEditable = <Component key={key}>{aboveEditable}</Component>;
      }
    }

    return aboveEditable;
  }, [additionalComponents, editable]);

  return <>{additionalComponentsRender}</>;
});

RichEditor.displayName = 'RichEditor';

export default RichEditor;
