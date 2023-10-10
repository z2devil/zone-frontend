'use client';

import clsx from 'clsx';
import { FormEventHandler, useCallback, useEffect, useRef } from 'react';
import { forwardMatch } from '@/lib/utils/editor';
import { marked } from 'marked';
import style from './style.module.scss';
import elementUtils from '@/lib/utils/editor/element';

interface EditorProps {
  className?: string;
}

const Editor = (props: EditorProps) => {
  const { className } = props;

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editorDOM = editorRef.current;
    if (!editorDOM) return;

    // 拦截复制
    const interceptCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;
      const selectedText = window.getSelection()?.toString() || '';
      const cleanedText = selectedText.replace(/\uFEFF/g, '');
      clipboardData.setData('text/plain', cleanedText);
    };

    editorDOM.addEventListener('copy', interceptCopy);
    editorDOM.addEventListener('cut', interceptCopy);

    () => {
      editorDOM.removeEventListener('copy', interceptCopy);
      editorDOM.removeEventListener('cut', interceptCopy);
    };
  }, []);

  const init = useCallback(() => {
    const editorDOM = editorRef.current;
    if (!editorDOM) return;
    editorDOM.innerHTML = '<div><br></div>';
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const handleContentChange: FormEventHandler = async e => {
    const nativeEvent = e.nativeEvent as InputEvent;

    // console.log(nativeEvent);

    /************************************************
     * ✨ 编辑器内容处理
     ************************************************/

    const editorDOM = editorRef.current;
    if (!editorDOM) return;

    const content = editorDOM.innerHTML;

    // 空内容处理
    if (content === '' || content === '<br>') {
      editorDOM.innerHTML = '<div><br></div>';
    }

    // 按键

    if (nativeEvent.inputType === 'insertText') {
      console.log('[ insertText ]');

      if (nativeEvent.data === ' ') {
        // 获取光标位置
        const selection = window.getSelection();
        console.log('[ selection ]', selection);
        if (!selection) return;

        // 转换光标前的内容
        elementUtils.parseInline(selection);

        // 阻止默认行为
        e.preventDefault();

        return;
      }
    }

    if (nativeEvent.inputType === 'deleteContentBackward') {
      console.log('[ deleteContentBackward ]');
    }

    if (nativeEvent.inputType === 'deleteContentForward') {
      console.log('[ deleteContentForward ]');
    }

    if (nativeEvent.inputType === 'insertParagraph') {
      console.log('[ insertParagraph ]');
    }

    if (nativeEvent.inputType === 'insertFromPaste') {
      console.log('[ paste ]');
    }
  };

  return (
    <div className={clsx(' flex-1 overflow-y-auto', className)}>
      <div
        ref={editorRef}
        className={clsx(
          style.editor,
          ' relative h-full w-full whitespace-break-spaces p-10 outline-none'
        )}
        style={{
          wordBreak: 'break-word',
          wordWrap: 'break-word',
        }}
        contentEditable
        spellCheck={false}
        tabIndex={1}
        onInput={handleContentChange}></div>
    </div>
  );
};

export default Editor;
