import { BlockElementType } from '@/lib/constants';
import { OrderedListElement, UnorderedListElement } from 'types/slate';

interface ListProps {
  attributes: any;
  children: any;
  element: OrderedListElement | UnorderedListElement;
}

const LIST_MAP = {
  [BlockElementType.OL_LIST]: 'ol',
  [BlockElementType.UL_LIST]: 'ul',
};

const List = ({ attributes, children, element }: ListProps) => {
  const Tag = LIST_MAP[element.type];
  return <Tag {...attributes}>{children}</Tag>;
};

export default List;
