import { useMemo } from 'react';
import { useSlate } from 'slate-react';
import { useAdditionalComponentsStore } from '@/lib/stores';
import { AdditionalComponentConfig } from '../utils';

/**
 * 获取编辑器的附加组件
 * @returns 附加组件配置数组
 */
export const useAdditionalComponents = (): AdditionalComponentConfig[] => {
  const editor = useSlate();

  const editorComponents = useAdditionalComponentsStore(
    state => state.editorComponents.get(editor) || []
  );

  return useMemo(() => {
    return editorComponents;
  }, [editorComponents]);
};
