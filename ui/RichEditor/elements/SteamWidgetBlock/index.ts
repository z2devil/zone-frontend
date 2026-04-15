import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import SteamWidgetBlockElement from './element';

const steamWidgetBlockPlugin = createPlugin({
  name: 'steam-widget',
  element: {
    type: BlockElementType.STEAM_WIDGET,
    component: SteamWidgetBlockElement,
    isBlock: true,
    isVoid: true,
  },
});

export default steamWidgetBlockPlugin;
