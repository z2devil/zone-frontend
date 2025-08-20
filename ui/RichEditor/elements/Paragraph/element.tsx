import { ParagraphElement } from 'types/slate';
import './style.css';

interface ParagraphProps {
  attributes: any;
  children: any;
  element: ParagraphElement;
}

const Paragraph = ({ attributes, children }: ParagraphProps) => {
  return <p {...attributes}>{children}</p>;
};

export default Paragraph;
