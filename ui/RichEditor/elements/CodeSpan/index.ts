import { InlineElementType } from '@/lib/constants';
import { createPlugin } from '@/ui/RichEditor/utils';
import CodeBlockElement from './element';

const codeBlockPlugin = createPlugin({
  name: 'codeSpan',
  element: {
    type: InlineElementType.CODE_SPAN,
    component: CodeBlockElement,
    isInline: true,
  },
});

export default codeBlockPlugin;
