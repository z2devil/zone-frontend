import { BlockElementType } from '@/lib/constants';
import { createElementPlugin } from 'ui/RichEditor/utils/elementPlugin';
import MusicBlockElement from './element';

const musicBlockPlugin = createElementPlugin({
  type: BlockElementType.MUSIC,
  element: MusicBlockElement,
  isBlock: true,
});

export default musicBlockPlugin;
