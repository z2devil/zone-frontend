import { BlockElementType } from '@/lib/constants';
import { HeadingElement } from 'types/slate';

interface HeadingProps {
  attributes: any;
  children: any;
  element: HeadingElement;
}

const HEADING_MAP = {
  [BlockElementType.HEADING_1]: 'h1',
  [BlockElementType.HEADING_2]: 'h2',
  [BlockElementType.HEADING_3]: 'h3',
  [BlockElementType.HEADING_4]: 'h4',
  [BlockElementType.HEADING_5]: 'h5',
  [BlockElementType.HEADING_6]: 'h6',
};

const Heading = ({ attributes, children, element }: HeadingProps) => {
  const Tag = HEADING_MAP[element.type];
  return <Tag {...attributes}>{children}</Tag>;
};

export default Heading;
