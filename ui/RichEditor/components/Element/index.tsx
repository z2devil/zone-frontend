import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';
import CodeBlock from './elements/CodeBlock';
import { BlockElementType, InlineElementType } from '../../constants';
import InlineChromiumBugfix from './elements/InlineChromiumBugfix';
import { CodeBlockElement } from 'types/slate';
import ImageBlock from './elements/ImageBlock';
import { useMemo } from 'react';
import MusicBlock from './elements/MusicBlock';
import WhiteBoardBlock from './elements/WhiteBoardBlock';
import VideoBlock from './elements/VideoBlock';
import LinkInline from './elements/LinkInline';
import CubeBlock from './elements/CubeBlock';

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  const editor = useSlate();

  const key = useMemo(() => {
    return ReactEditor.findPath(editor, element).join('-');
  }, [editor, element]);

  switch (element.type) {
    case BlockElementType.PARAGRAPH:
      return <p {...attributes}>{children}</p>;
    case BlockElementType.HEADING_1:
      return (
        <h1 {...attributes} id={key}>
          {children}
        </h1>
      );
    case BlockElementType.HEADING_2:
      return (
        <h2 {...attributes} id={key}>
          {children}
        </h2>
      );
    case BlockElementType.HEADING_3:
      return (
        <h3 {...attributes} id={key}>
          {children}
        </h3>
      );
    case BlockElementType.HEADING_4:
      return (
        <h4 {...attributes} id={key}>
          {children}
        </h4>
      );
    case BlockElementType.HEADING_5:
      return (
        <h5 {...attributes} id={key}>
          {children}
        </h5>
      );
    case BlockElementType.HEADING_6:
      return (
        <h6 {...attributes} id={key}>
          {children}
        </h6>
      );
    case BlockElementType.OL_LIST:
      return <ol {...attributes}>{children}</ol>;
    case BlockElementType.UL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case BlockElementType.BLOCK_QUOTE:
      return <blockquote {...attributes}>{children}</blockquote>;
    case InlineElementType.CODE_SPAN:
      return (
        <code-span {...attributes}>
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </code-span>
      );
    case InlineElementType.LINK:
      return (
        <LinkInline attributes={attributes} element={element}>
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </LinkInline>
      );
    case BlockElementType.CODE_BLOCK:
      return (
        <CodeBlock
          attributes={attributes}
          element={props.element as CodeBlockElement}>
          {children}
        </CodeBlock>
      );
    case BlockElementType.IMAGE:
      return (
        <ImageBlock attributes={attributes} element={element}>
          {children}
        </ImageBlock>
      );
    case BlockElementType.VIDEO:
      return (
        <VideoBlock attributes={attributes} element={element}>
          {children}
        </VideoBlock>
      );
    case BlockElementType.BUTTON:
      return <button {...attributes}>{children}</button>;
    case BlockElementType.MUSIC:
      return (
        <MusicBlock attributes={attributes} element={element}>
          {children}
        </MusicBlock>
      );
    case BlockElementType.WHITE_BOARD:
      return (
        <WhiteBoardBlock attributes={attributes} element={element}>
          {children}
        </WhiteBoardBlock>
      );
    case BlockElementType.CUBE:
      return (
        <CubeBlock attributes={attributes} element={element}>
          {children}
        </CubeBlock>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export default Element;
