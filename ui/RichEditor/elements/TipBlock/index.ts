import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import TipBlockElement from './element';

const tipBlockPlugin = createElementPlugin({
  type: BlockElementType.TIP,
  element: TipBlockElement,
});

export default tipBlockPlugin;
