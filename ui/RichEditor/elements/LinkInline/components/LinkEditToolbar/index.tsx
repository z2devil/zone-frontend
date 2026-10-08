import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ReactEditor, useSlate, useSlateSelection } from 'slate-react';
import { Transforms, Editor, Node, Element } from 'slate';
import { throttle } from 'lodash';
import styles from './style.module.scss';
import { useClickAway } from 'react-use';
import { InlineElementType } from '@/lib/constants';
import { isLinkInputAllowed } from '../../safeUrl';

const LinkEditToolbar = () => {
  const editor = useSlate();

  const selection = useSlateSelection();

  const elementEntry = useMemo(() => {
    if (!selection) return;
    return Editor.above(editor, {
      at: selection,
      match: node =>
        Element.isElement(node) && node.type === InlineElementType.LINK,
    });
  }, [editor, selection]);

  const visible = useMemo(() => !!elementEntry, [elementEntry]);

  const [position, setPosition] = useState([0, 0]);

  const [url, setUrl] = useState('');

  const [linkText, setLinkText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const currentLinkText = useMemo(() => {
    if (!elementEntry) return '';
    return Node.string(elementEntry[0]);
  }, [elementEntry]);

  useEffect(() => {
    if (visible && elementEntry) {
      setUrl(elementEntry[0].url || '');
      setLinkText(currentLinkText);

      const domNode = ReactEditor.toDOMNode(editor, elementEntry[0]);
      const rect = domNode.getBoundingClientRect();

      setPosition([
        rect.bottom + window.scrollY + 8,
        rect.left + window.scrollX,
      ]);

      const updatePosition = throttle(() => {
        try {
          const rect = domNode.getBoundingClientRect();
          setPosition([
            rect.bottom + window.scrollY + 8,
            rect.left + window.scrollX,
          ]);
        } catch (error) {
          console.warn('定位浮层失败:', error);
        }
      }, 100);

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        updatePosition.cancel();
      };
    } else {
      setUrl('');
      setLinkText('');
    }
  }, [visible, currentLinkText, elementEntry, editor]);

  const throttledUpdateUrl = useMemo(
    () =>
      throttle((value: string) => {
        if (!elementEntry) return;
        // 危险协议不写入文档，保留上一次的合法值
        if (!isLinkInputAllowed(value)) return;
        Transforms.setNodes(
          editor,
          { url: value.trim() },
          { at: elementEntry[1] }
        );
      }, 300),
    [editor, elementEntry]
  );

  const throttledUpdateText = useMemo(
    () =>
      throttle((value: string) => {
        if (!elementEntry) return;
        const currentText = Editor.string(editor, elementEntry[1]);
        if (currentText !== value) {
          Transforms.insertText(editor, value, { at: elementEntry[1] });
        }
      }, 300),
    [editor, elementEntry]
  );

  const handleUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setUrl(value);
      throttledUpdateUrl(value);
    },
    [throttledUpdateUrl]
  );

  const urlAllowed = useMemo(() => isLinkInputAllowed(url), [url]);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setLinkText(value);
      throttledUpdateText(value);
    },
    [throttledUpdateText]
  );

  useEffect(() => {
    const urlThrottle = throttledUpdateUrl;
    const textThrottle = throttledUpdateText;

    return () => {
      urlThrottle.cancel();
      textThrottle.cancel();
    };
  }, [throttledUpdateText, throttledUpdateUrl]);

  const handleRemoveLink = useCallback(() => {
    if (!elementEntry) return;
    Transforms.unwrapNodes(editor, { at: elementEntry[1] });
  }, [editor, elementEntry]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        Transforms.deselect(editor);
      }
    },
    [editor]
  );

  useClickAway(containerRef, () => Transforms.deselect(editor));

  const style = useMemo(() => {
    return {
      top: position[0],
      left: position[1],
    } as React.CSSProperties;
  }, [position]);

  if (!visible) return null;

  return (
    <div
      className={styles.linkEditToolbar}
      ref={containerRef}
      style={style}
      onKeyDown={handleKeyDown}>
      <div className={styles.linkEditForm}>
        <div className={styles.linkEditField}>
          <label className={styles.linkEditLabel}>页面或 URL</label>
          <input
            className={styles.linkEditInput}
            placeholder='请输入链接地址'
            type='url'
            value={url}
            onChange={handleUrlChange}
          />
          {!urlAllowed && (
            <span className={styles.linkEditError}>
              仅支持 http、https、mailto 链接或站内路径
            </span>
          )}
        </div>
        <div className={styles.linkEditField}>
          <label className={styles.linkEditLabel}>链接文本</label>
          <input
            className={styles.linkEditInput}
            placeholder='请输入链接文本'
            type='text'
            value={linkText}
            onChange={handleTextChange}
          />
        </div>
        <div className={styles.linkEditActions}>
          <button
            className={styles.linkRemoveButton}
            type='button'
            onClick={handleRemoveLink}>
            <span className={styles.linkRemoveIcon}>🗑️</span>
            移除链接
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkEditToolbar;
