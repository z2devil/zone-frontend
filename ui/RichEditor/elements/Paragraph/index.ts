import { BlockElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import CodeLineBlockElement from './element';

const codeLineBlockPlugin = createPlugin({
  name: 'paragraph',
  element: {
    type: BlockElementType.PARAGRAPH,
    component: CodeLineBlockElement,
  },
});

export default codeLineBlockPlugin;
