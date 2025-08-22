import { BlockQuoteElement } from 'types/slate';

interface BlockQuoteProps {
  attributes: any;
  children: any;
  element: BlockQuoteElement;
}

const BlockQuote = ({ attributes, children }: BlockQuoteProps) => {
  return <blockquote {...attributes}>{children}</blockquote>;
};

export default BlockQuote;
