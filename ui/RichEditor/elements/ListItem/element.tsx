import { ListItemElement } from 'types/slate';

interface ListItemProps {
  attributes: any;
  children: any;
  element: ListItemElement;
}

const ListItem = ({ attributes, children }: ListItemProps) => {
  return <li {...attributes}>{children}</li>;
};

export default ListItem;
