import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import LayoutItemBlockElement from './element';

const layoutItemBlockPlugin = createPlugin({
  name: 'layoutItem',
  element: {
    type: BlockElementType.LAYOUT_ITEM,
    component: LayoutItemBlockElement,
  },
});

export default layoutItemBlockPlugin;
