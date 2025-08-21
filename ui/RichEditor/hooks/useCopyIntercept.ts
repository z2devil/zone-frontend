import { RefObject, useCallback, useEffect } from 'react';

export const useCopyIntercept = (editorRef: RefObject<HTMLDivElement>) => {
  const handleCopy = useCallback((e: ClipboardEvent) => {
    e.preventDefault();

    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString();
    const cleanedText = selectedText.replace(/\uFEFF/g, '');
    clipboardData.setData('text/plain', cleanedText);
  }, []);

  useEffect(() => {
    const editorDOM = editorRef.current;
    if (!editorDOM) return;

    editorDOM.addEventListener('copy', handleCopy);
    editorDOM.addEventListener('cut', handleCopy);

    return () => {
      editorDOM.removeEventListener('copy', handleCopy);
      editorDOM.removeEventListener('cut', handleCopy);
    };
  }, [editorRef, handleCopy]);
};
