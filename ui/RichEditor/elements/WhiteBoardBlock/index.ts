import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import WhiteBoardBlockElement from './element';

const whiteBoardBlockPlugin = createElementPlugin({
  type: BlockElementType.WHITE_BOARD,
  element: WhiteBoardBlockElement,
  isBlock: true,
});

export default whiteBoardBlockPlugin;
