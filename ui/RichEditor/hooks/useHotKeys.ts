import { EDITOR_TO_HOTKEY_MAP } from '@/lib/constants';
import { useKeyPressEvent } from 'react-use';
import { Editor } from 'slate';
import { useSlateStatic } from 'slate-react';
import { WithEditorFirstArg } from 'slate/dist/utils';

/**
 * 快捷键配置
 */
export interface ActionKeyConfig {
  label: string;
  hotkey: {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  }[];
  action: WithEditorFirstArg<(e: KeyboardEvent) => void>;
}

/**
 * 构建快捷键组合
 * @param param0 快捷键配置
 * @returns 快捷键组合
 */
const buildKeyCombination = ({
  key,
  ctrlKey = false,
  metaKey = false,
  shiftKey = false,
  altKey = false,
}: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}) => {
  return `${key.toLocaleLowerCase()}${ctrlKey ? '+ctrl' : ''}${metaKey ? '+meta' : ''}${
    shiftKey ? '+shift' : ''
  }${altKey ? '+alt' : ''}`;
};

/**
 * 处理键盘按下事件
 * @param editor 编辑器
 * @param e 键盘事件
 */
const handleKeydownEvent = (editor: Editor, e: KeyboardEvent) => {
  const hotkeyMap = EDITOR_TO_HOTKEY_MAP.get(editor);
  if (!hotkeyMap) return;

  const keyCombination = buildKeyCombination(e);
  const matchedAction = hotkeyMap[keyCombination];

  console.log('[ keyCombination ]', keyCombination, matchedAction);

  if (matchedAction) {
    matchedAction(editor, e);
  }
};

/**
 * 设置快捷键
 * @param editor 编辑器
 * @param actionConfigs 快捷键配置
 */
export const setupHotkeys = (
  editor: Editor,
  actionConfigs: ActionKeyConfig[]
) => {
  const map: Record<
    string,
    WithEditorFirstArg<(e: KeyboardEvent) => void>
  > = EDITOR_TO_HOTKEY_MAP.get(editor) || {};
  for (const actionConfig of actionConfigs) {
    actionConfig.hotkey.forEach(hotkeyConfig => {
      const keyCombination = buildKeyCombination(hotkeyConfig);
      map[keyCombination] = actionConfig.action;
    });
  }
  EDITOR_TO_HOTKEY_MAP.set(editor, map);
};

/**
 * 使用快捷键
 */
export const useHotKeys = () => {
  const editor = useSlateStatic();

  useKeyPressEvent((event: KeyboardEvent) => {
    if (event.type !== 'keydown') return false;
    handleKeydownEvent(editor, event);
    return true;
  });
};
