import { BlockElementType } from '@/lib/constants';
import { OrderedListElement, UnorderedListElement } from 'types/slate';
import styles from './style.module.scss';

interface ListProps {
  attributes: any;
  children: any;
  element: OrderedListElement | UnorderedListElement;
}

const LIST_MAP = {
  [BlockElementType.OL_LIST]: 'ol',
  [BlockElementType.UL_LIST]: 'ul',
};

const STYLE_MAP = {
  [BlockElementType.OL_LIST]: styles.orderedList,
  [BlockElementType.UL_LIST]: styles.unorderedList,
};

const List = ({ attributes, children, element }: ListProps) => {
  const Tag = LIST_MAP[element.type];
  const className = STYLE_MAP[element.type];
  return (
    <Tag {...attributes} className={className}>
      {children}
    </Tag>
  );
};

export default List;
