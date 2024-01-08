import { RichEditor, ElementType } from 'types/slate';
import { InlineElementType } from '../constans';

const INLINE_ELEMENTS: ElementType[] = [
  InlineElementType.CODE_SPAN,
  InlineElementType.LINK,
];

const READONLY_INLINE_ELEMENTS: ElementType[] = [];

const UNSELECTABLE_INLINE_ELEMENTS: ElementType[] = [];

const withInlines = (editor: RichEditor) => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor;

  editor.isInline = element => {
    return INLINE_ELEMENTS.includes(element.type) ? true : isInline(element);
  };

  editor.isElementReadOnly = element => {
    return READONLY_INLINE_ELEMENTS.includes(element.type)
      ? true
      : isElementReadOnly(element);
  };

  editor.isSelectable = element => {
    return UNSELECTABLE_INLINE_ELEMENTS.includes(element.type)
      ? false
      : isSelectable(element);
  };

  return editor;
};

export { withInlines };
