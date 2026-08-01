import { BlockElementType } from '@/lib/constants';
import { Descendant } from 'slate';

function CodeTransfromToElementChildren(value = ''): Descendant[] {
  return value.split(/\r?\n/).map(line => {
    return {
      type: BlockElementType.CODE_LINE_BLOCK,
      children: [
        {
          text: line,
        },
      ],
    };
  });
}

export default CodeTransfromToElementChildren;
