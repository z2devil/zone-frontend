import { ButtonElement } from 'types/slate';

interface ButtonProps {
  attributes: any;
  children: any;
  element: ButtonElement;
}

const Button = ({ attributes, children }: ButtonProps) => {
  return <button {...attributes}>{children}</button>;
};

export default Button;
