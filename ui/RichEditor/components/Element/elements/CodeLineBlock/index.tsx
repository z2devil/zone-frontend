import { CodeLineBlockElement } from 'types/slate';

interface CodeLineBlockProps {
  attributes: any;
  children: any;
  element: CodeLineBlockElement;
}

const CodeLineBlock = ({ attributes, children }: CodeLineBlockProps) => {
  return (
    <div className='relative' {...attributes}>
      {children}
    </div>
  );
};

export default CodeLineBlock;
