import clsx from 'clsx';
import { RenderLeafProps } from 'slate-react';
import style from '../../style.module.scss';

const Leaf = (props: RenderLeafProps) => {
  return (
    <span
      {...props.attributes}
      className={clsx(
        props.leaf.bold && style.bold,
        props.leaf.italic && style.italic,
        props.leaf.underline && style.underline,
        props.leaf.strikethrough && style.strikethrough
      )}>
      {props.children}
    </span>
  );
};

export default Leaf;
