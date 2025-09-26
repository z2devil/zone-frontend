import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import ListItemElement from './element';

const listItemPlugin = createPlugin({
  name: 'listItem',
  element: {
    type: BlockElementType.LIST_ITEM,
    component: ListItemElement,
  },
});

export default listItemPlugin;
