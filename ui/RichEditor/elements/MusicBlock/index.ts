import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import MusicBlockElement from './element';

const musicBlockPlugin = createPlugin({
  name: 'music',
  element: {
    type: BlockElementType.MUSIC,
    component: MusicBlockElement,
    isBlock: true,
    isVoid: true,
  },
});

export default musicBlockPlugin;
