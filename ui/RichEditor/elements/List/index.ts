import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import ListElement from './element';

const listPlugin = createElementPlugin({
  type: [BlockElementType.OL_LIST, BlockElementType.UL_LIST],
  element: ListElement,
});

export default listPlugin;
