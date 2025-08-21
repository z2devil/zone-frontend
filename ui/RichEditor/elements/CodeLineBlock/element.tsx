import { CodeLineBlockElement } from 'types/slate';

interface CodeLineBlockProps {
  attributes: any;
  children: any;
  element: CodeLineBlockElement;
}

const CodeLineBlock = ({ attributes, children }: CodeLineBlockProps) => {
  return (
    <p className='relative' {...attributes}>
      {children}
    </p>
  );
};

export default CodeLineBlock;
