import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import LayoutBlockElement from './element';

const layoutBlockPlugin = createElementPlugin({
  type: BlockElementType.LAYOUT,
  element: LayoutBlockElement,
});

export default layoutBlockPlugin;
