import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import ButtonElement from './element';

const buttonPlugin = createElementPlugin({
  type: BlockElementType.BUTTON,
  element: ButtonElement,
  isInline: true,
  isVoid: true,
});

export default buttonPlugin;
