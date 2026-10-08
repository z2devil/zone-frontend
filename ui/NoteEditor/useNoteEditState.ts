import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Descendant, Editor } from 'slate';
import { saveNoteDraft } from '@/lib/note-draft';
import { useModalUtilsStore, useNotificationUtilsStore } from '@/lib/stores';
import { NotificationType } from '@/ui/Notification/components/Notification';

/**
 * pristine：自加载后未修改；dirty：有未保存修改；saved：已保存为草稿且之后未修改
 */
type EditStatus = 'pristine' | 'dirty' | 'saved';

interface UseNoteEditStateOptions {
  editor: Editor;
  noteId: string;
  initialContent: Descendant[];
  /**
   * 0 编辑；1 发布配置；2 已发布
   */
  step: number;
  setStep: (step: number) => void;
}

/**
 * 两个笔记编辑入口共用的编辑状态：内容引用、草稿保存（Ctrl/Cmd+S）、
 * 保存状态、退出确认与刷新拦截。
 */
export const useNoteEditState = (options: UseNoteEditStateOptions) => {
  const { editor, noteId, initialContent, step, setStep } = options;

  const navigation = useRouter();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const { utils: modalUtils } = useModalUtilsStore();

  const contentRef = useRef<Descendant[]>(initialContent);

  const [status, setStatus] = useState<EditStatus>('pristine');

  const hasUnsavedChanges = status === 'dirty';

  const handleChange = useCallback(
    (content: Descendant[]) => {
      contentRef.current = content;
      if (editor.operations.some(op => op.type !== 'set_selection')) {
        setStatus('dirty');
      }
    },
    [editor]
  );

  /************************************************
   * ✨ 保存草稿
   ************************************************/

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        saveNoteDraft(noteId, editor.children);
        setStatus('saved');
        notificationUtils?.open({
          type: NotificationType.SUCCESS,
          content: '保存成功',
          duration: 3,
        });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, noteId, notificationUtils]);

  /************************************************
   * ✨ 退出
   ************************************************/

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleBack = useCallback(() => {
    const goBack = () => {
      setStep(step - 1);
      if (step > 0) return;
      setTimeout(() => {
        navigation.back();
      }, 400);
    };
    if (step === 0 && hasUnsavedChanges) {
      const uuid = modalUtils?.open({
        title: '退出编辑',
        children: '有未保存的修改，确定退出编辑吗？',
        okText: '确定',
        onOk: () => {
          modalUtils?.close(uuid);
          goBack();
        },
        cancelText: '取消',
        onCancel: () => {
          modalUtils?.close(uuid);
        },
      });
      return;
    }
    goBack();
  }, [hasUnsavedChanges, modalUtils, navigation, setStep, step]);

  return {
    contentRef,
    handleChange,
    handleBack,
    isSaved: status === 'saved',
    hasUnsavedChanges,
  };
};
