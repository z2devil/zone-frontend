import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import CollapsibleBlockTitleElement from './element';

const collapsibleBlockTitlePlugin = createPlugin({
  name: 'collapsibleBlockTitle',
  element: {
    type: BlockElementType.COLLAPSIBLE_BLOCK_TITLE,
    component: CollapsibleBlockTitleElement,
  },
});

export default collapsibleBlockTitlePlugin;
