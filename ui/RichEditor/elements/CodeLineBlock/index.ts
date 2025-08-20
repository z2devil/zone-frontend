import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import CodeLineBlockElement from './element';

const codeLineBlockPlugin = createElementPlugin({
  type: BlockElementType.CODE_LINE_BLOCK,
  element: CodeLineBlockElement,
});

export default codeLineBlockPlugin;
