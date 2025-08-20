import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import ImageBlockElement from './element';

const imageBlockPlugin = createElementPlugin({
  type: BlockElementType.IMAGE,
  element: ImageBlockElement,
});

export default imageBlockPlugin;
