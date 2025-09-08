import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import ImageBlockElement from './element';

const imageBlockPlugin = createPlugin({
  name: 'image',
  element: {
    type: BlockElementType.IMAGE,
    component: ImageBlockElement,
    isBlock: true,
    isVoid: true,
  },
});

export default imageBlockPlugin;
