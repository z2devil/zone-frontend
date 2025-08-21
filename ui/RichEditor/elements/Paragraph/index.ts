import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import CodeBlockElement from './element';

const codeBlockPlugin = createElementPlugin({
  type: BlockElementType.PARAGRAPH,
  element: CodeBlockElement,
});

export default codeBlockPlugin;
