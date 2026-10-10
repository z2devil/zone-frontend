import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import CollapsibleBlockContentElement from './element';

const collapsibleBlockContentPlugin = createPlugin({
  name: 'collapsibleBlockContent',
  element: {
    type: BlockElementType.COLLAPSIBLE_BLOCK_CONTENT,
    component: CollapsibleBlockContentElement,
  },
});

export default collapsibleBlockContentPlugin;
