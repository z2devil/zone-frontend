import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import ButtonElement from './element';

const buttonPlugin = createPlugin({
  name: 'button',
  element: {
    type: BlockElementType.BUTTON,
    component: ButtonElement,
    isInline: true,
    isVoid: true,
  },
});

export default buttonPlugin;
