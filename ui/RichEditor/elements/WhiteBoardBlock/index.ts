import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import WhiteBoardBlockElement from './element';

const whiteBoardBlockPlugin = createPlugin({
  name: 'whiteBoard',
  element: {
    type: BlockElementType.WHITE_BOARD,
    component: WhiteBoardBlockElement,
    isBlock: true,
    isVoid: true,
  },
});

export default whiteBoardBlockPlugin;
