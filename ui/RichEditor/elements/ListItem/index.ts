import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import ListItemElement from './element';

const listItemPlugin = createElementPlugin({
  type: BlockElementType.LIST_ITEM,
  element: ListItemElement,
});

export default listItemPlugin;
