import { InlineElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import LinkInlineElement from './element';
import LinkEditToolbar from './components/LinkEditToolbar';

const linkInlinePlugin = createPlugin({
  name: 'link',
  element: {
    type: InlineElementType.LINK,
    component: LinkInlineElement,
    isInline: true,
  },
  additionalComponent: {
    key: 'linkEditToolbar',
    component: LinkEditToolbar,
    position: 'after',
  },
});

export default linkInlinePlugin;
