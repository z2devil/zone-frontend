import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import LayoutItemBlockElement from './element';

const layoutItemBlockPlugin = createElementPlugin({
  type: BlockElementType.LAYOUT_ITEM,
  element: LayoutItemBlockElement,
});

export default layoutItemBlockPlugin;
