import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import BlockQuoteElement from './element';

const blockQuotePlugin = createPlugin({
  name: 'blockQuote',
  element: {
    type: BlockElementType.BLOCK_QUOTE,
    component: BlockQuoteElement,
  },
});

export default blockQuotePlugin;
