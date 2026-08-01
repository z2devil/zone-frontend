import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import SteamVideoBlockElement from './element';

const steamVideoBlockPlugin = createPlugin({
  name: 'steam-video',
  element: {
    type: BlockElementType.STEAM_VIDEO,
    component: SteamVideoBlockElement,
    isBlock: true,
    isVoid: true,
  },
});

export default steamVideoBlockPlugin;
