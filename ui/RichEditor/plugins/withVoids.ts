import { BlockElementType } from '@/lib/constants';
import { RichEditor, ElementType } from 'types/slate';

export const VOID_ELEMENTS: ElementType[] = [
  // BlockElementType.CODE_BLOCK,
  BlockElementType.IMAGE,
  BlockElementType.VIDEO,
  BlockElementType.BUTTON,
  BlockElementType.MUSIC,
  BlockElementType.WHITE_BOARD,
  // BlockElementType.CUBE,
  // BlockElementType.LAYOUT,
  // BlockElementType.LAYOUT_ITEM,
];

export const withVoids = (editor: RichEditor) => {
  const { insertData, insertText, isVoid, isElementReadOnly } = editor;

  editor.isVoid = element => {
    return VOID_ELEMENTS.includes(element.type) ? true : isVoid(element);
  };

  // editor.isElementReadOnly = element => {
  //   return VOID_ELEMENTS.includes(element.type)
  //     ? true
  //     : isElementReadOnly(element);
  // };

  return editor;
};
