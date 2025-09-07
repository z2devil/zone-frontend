import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import HeadingElement from './element';

const headingPlugin = createPlugin({
  name: 'heading',
  element: {
    type: [
      BlockElementType.HEADING_1,
      BlockElementType.HEADING_2,
      BlockElementType.HEADING_3,
      BlockElementType.HEADING_4,
      BlockElementType.HEADING_5,
      BlockElementType.HEADING_6,
    ],
    component: HeadingElement,
  },
});

export default headingPlugin;
