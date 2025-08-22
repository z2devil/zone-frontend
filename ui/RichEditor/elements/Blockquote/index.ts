import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import BlockQuoteElement from './element';

const blockQuotePlugin = createElementPlugin({
  type: BlockElementType.BLOCK_QUOTE,
  element: BlockQuoteElement,
});

export default blockQuotePlugin;
