import { RenderElementProps } from 'slate-react';
import { ElementType } from 'types';

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case ElementType.PARAGRAPH:
      return <z2-p {...attributes}>{children}</z2-p>;
    case ElementType.HEADING_1:
      return <z2-h1 {...attributes}>{children}</z2-h1>;
    case ElementType.HEADING_2:
      return <z2-h2 {...attributes}>{children}</z2-h2>;
    case ElementType.HEADING_3:
      return <z2-h3 {...attributes}>{children}</z2-h3>;
    case ElementType.HEADING_4:
      return <z2-h4 {...attributes}>{children}</z2-h4>;
    case ElementType.HEADING_5:
      return <z2-h5 {...attributes}>{children}</z2-h5>;
    case ElementType.HEADING_6:
      return <z2-h6 {...attributes}>{children}</z2-h6>;
    case ElementType.LIST_ITEM:
      return <z2-li {...attributes}>{children}</z2-li>;
    case ElementType.BLOCK_QUOTE:
      return <z2-blockquote {...attributes}>{children}</z2-blockquote>;
    case ElementType.CODE_LINE:
      return <pre {...attributes}>{children}</pre>;
    case ElementType.CODE_BLOCK:
      return <pre {...attributes}>{children}</pre>;
    case ElementType.LINK:
      return <a {...attributes}>{children}</a>;
    case ElementType.IMAGE:
      return <img {...attributes} />;
    case ElementType.BUTTON:
      return <button {...attributes}>{children}</button>;
    default:
      return <z2-p {...attributes}>{children}</z2-p>;
  }
};

export default Element;
