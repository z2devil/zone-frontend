import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import HeadingElement from './element';

const headingPlugin = createElementPlugin({
  type: [
    BlockElementType.HEADING_1,
    BlockElementType.HEADING_2,
    BlockElementType.HEADING_3,
    BlockElementType.HEADING_4,
    BlockElementType.HEADING_5,
    BlockElementType.HEADING_6,
  ],
  element: HeadingElement,
});

export default headingPlugin;
