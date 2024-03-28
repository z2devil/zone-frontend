import { Descendant } from 'slate';
import { BlockElementType } from '../../constants';

function CodeTransfromToElementChildren(value = ''): Descendant[] {
  if (!value || value.length === 0) {
    return [];
  }

  return value.split('\r\n').map(line => {
    return {
      type: BlockElementType.PARAGRAPH,
      children: [
        {
          text: line,
        },
      ],
    };
  });
}

export default CodeTransfromToElementChildren;
