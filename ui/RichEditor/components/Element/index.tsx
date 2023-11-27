import { RenderElementProps } from 'slate-react';
import CodeBlock from './elements/CodeBlock';
import { BlockElementType, InlineElementType } from '../../constans';
import InlineChromiumBugfix from './elements/InlineChromiumBugfix';
import { CodeBlockElement } from 'types/slate';

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case BlockElementType.PARAGRAPH:
      return <z2-p {...attributes}>{children}</z2-p>;
    case BlockElementType.HEADING_1:
      return <z2-h1 {...attributes}>{children}</z2-h1>;
    case BlockElementType.HEADING_2:
      return <z2-h2 {...attributes}>{children}</z2-h2>;
    case BlockElementType.HEADING_3:
      return <z2-h3 {...attributes}>{children}</z2-h3>;
    case BlockElementType.HEADING_4:
      return <z2-h4 {...attributes}>{children}</z2-h4>;
    case BlockElementType.HEADING_5:
      return <z2-h5 {...attributes}>{children}</z2-h5>;
    case BlockElementType.HEADING_6:
      return <z2-h6 {...attributes}>{children}</z2-h6>;
    case BlockElementType.OL_LIST:
      return <z2-ol {...attributes}>{children}</z2-ol>;
    case BlockElementType.UL_LIST:
      return <z2-ul {...attributes}>{children}</z2-ul>;
    case BlockElementType.BLOCK_QUOTE:
      return <z2-blockquote {...attributes}>{children}</z2-blockquote>;
    case InlineElementType.CODE_LINE:
      return (
        <z2-codeline {...attributes}>
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </z2-codeline>
      );
    case BlockElementType.CODE_BLOCK:
      return (
        <CodeBlock
          attributes={attributes}
          element={props.element as CodeBlockElement}>
          {children}
        </CodeBlock>
      );
    case InlineElementType.LINK:
      return <a {...attributes}>{children}</a>;
    case BlockElementType.IMAGE:
    case BlockElementType.BUTTON:
      return <button {...attributes}>{children}</button>;
    default:
      return <z2-p {...attributes}>{children}</z2-p>;
  }
};

export default Element;
