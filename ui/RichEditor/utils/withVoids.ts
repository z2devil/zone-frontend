import { RichEditor, ElementType } from 'types/slate';
import { BlockElementType } from '../constans';

const VOID_ELEMENTS: ElementType[] = [
  BlockElementType.CODE_BLOCK,
  BlockElementType.IMAGE,
  BlockElementType.BUTTON,
];

const withVoids = (editor: RichEditor) => {
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

export { withVoids };
