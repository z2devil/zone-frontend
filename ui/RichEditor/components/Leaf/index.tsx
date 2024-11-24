import clsx from 'clsx';
import { RenderLeafProps } from 'slate-react';
import style from './style.module.scss';

const Leaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;
  const { bold, italic, underline, strikethrough, ...rest } = leaf;

  return (
    <span
      {...attributes}
      className={clsx(
        bold && style['text-bold'],
        italic && style['text-italic'],
        underline && style['text-underline'],
        strikethrough && style['text-strikethrough'],
        ...Object.keys(rest)
      )}>
      {children}
    </span>
  );
};

export default Leaf;
