import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import VideoBlockElement from './element';

const videoBlockPlugin = createElementPlugin({
  type: BlockElementType.VIDEO,
  element: VideoBlockElement,
  isBlock: true,
});

export default videoBlockPlugin;
