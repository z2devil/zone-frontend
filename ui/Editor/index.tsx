'use client';

import clsx from 'clsx';
import {
  FormEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { forwardMatch } from '@/lib/utils/editor';
import { marked } from 'marked';
import style from './style.module.scss';
import elementUtils, { PLACEHOLDER_CHAR } from '@/lib/utils/editor/element';
import useCopyIntercept from './hooks/useCopyIntercept';

interface EditorProps {
  className?: string;
}

const Editor = (props: EditorProps) => {
  const { className } = props;

  const editorRef = useRef<HTMLDivElement>(null);

  useCopyIntercept(editorRef);

  const init = useCallback(() => {
    const editorDOM = editorRef.current;
    if (!editorDOM) return;
    editorDOM.innerHTML = '<div><br></div>';
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = e => {
    // console.log('[ handleKeyDown ]', e);
    const selection = window.getSelection();
    console.log('[ selection ]', selection);

    if (e.key === 'Backspace') {
      // 判断当前光标是否在占位符中
      const selection = window.getSelection();
      if (!selection) return;
      console.log(
        '[ selection ]',
        selection.anchorNode,
        selection.anchorNode?.parentElement
      );
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      const parentElement = anchorNode?.parentElement;
      if (
        !anchorNode ||
        !focusNode ||
        anchorNode !== focusNode ||
        !parentElement ||
        parentElement.className !== 'placeholder'
      ) {
        return;
      }

      // 左移光标
      const previousSibling = parentElement.previousSibling;
      if (!previousSibling) return;
      selection.collapse(previousSibling, 0);

      // 阻止退格键的默认行为
      console.log('[ preventDefault ]');
      e.preventDefault();
      return;
    }
  };

  const handleInput: FormEventHandler = async e => {
    const nativeEvent = e.nativeEvent as InputEvent;
    console.log('[ handleInput ]', nativeEvent);
    /************************************************
     * ✨ 编辑器内容处理
     ************************************************/
    const editorDOM = editorRef.current;
    if (!editorDOM) return;
    const content = editorDOM.innerHTML;
    // 空内容处理
    if (content === '' || content === '<br>') {
      editorDOM.innerHTML = '<div><br></span>';
    }
    // 清除浏览器自带样式
    editorDOM.querySelectorAll('[style]').forEach(item => {
      item.removeAttribute('style');
    });
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
        return;
      } else {
        // 判断当前光标是否在占位符中
        const selection = window.getSelection();
        if (!selection) return;
        const anchorNode = selection.anchorNode;
        const focusNode = selection.focusNode;
        if (!anchorNode || !focusNode || anchorNode !== focusNode) return;
        // 判断anchorNode的class
        const placeholder = anchorNode.parentElement;
        if (!placeholder || placeholder.className !== 'placeholder') return;
        const placeholderText = placeholder.innerText.replace(/\uFEFF/g, '');
        // 将输入的字符插入到占位符之后
        const range = document.createRange();
        console.log('[ anchorNode ]', placeholderText);
        const row = placeholder.parentNode;
        if (!row) return;
        range.setStart(row, row.childNodes.length);
        range.setEnd(row, row.childNodes.length);
        selection.removeAllRanges();
        selection.addRange(range);
        range.deleteContents();
        range.insertNode(document.createTextNode(placeholderText));
        range.collapse(false);
        placeholder.innerHTML = PLACEHOLDER_CHAR;
        return;
      }
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
        onKeyDown={handleKeyDown}
        onInput={handleInput}></div>
    </div>
  );
};

export default Editor;
