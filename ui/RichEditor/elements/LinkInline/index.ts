import { InlineElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import LinkInlineElement from './element';

const linkInlinePlugin = createElementPlugin({
  type: InlineElementType.LINK,
  element: LinkInlineElement,
  isInline: true,
});

export default linkInlinePlugin;
