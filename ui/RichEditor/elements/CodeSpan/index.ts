import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import CodeBlockElement from './element';

const codeBlockPlugin = createElementPlugin({
  type: BlockElementType.CODE_BLOCK,
  element: CodeBlockElement,
  isInline: true,
});

export default codeBlockPlugin;
