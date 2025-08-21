import { InlineElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import CodeBlockElement from './element';

const codeBlockPlugin = createElementPlugin({
  type: InlineElementType.CODE_SPAN,
  element: CodeBlockElement,
  isInline: true,
});

export default codeBlockPlugin;
