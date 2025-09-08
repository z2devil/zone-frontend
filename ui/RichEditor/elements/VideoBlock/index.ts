import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import VideoBlockElement from './element';

const videoBlockPlugin = createPlugin({
  name: 'video',
  element: {
    type: BlockElementType.VIDEO,
    component: VideoBlockElement,
    isBlock: true,
    isVoid: true,
  },
});

export default videoBlockPlugin;
