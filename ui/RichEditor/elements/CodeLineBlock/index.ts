import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import CodeLineBlockElement from './element';

const codeLineBlockPlugin = createPlugin({
  name: 'codeLine',
  element: {
    type: BlockElementType.CODE_LINE_BLOCK,
    component: CodeLineBlockElement,
  },
});

export default codeLineBlockPlugin;
