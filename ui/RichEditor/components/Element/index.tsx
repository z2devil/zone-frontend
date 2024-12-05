import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlate,
} from 'slate-react';
import CodeBlock from './elements/CodeBlock';
import InlineChromiumBugfix from './elements/InlineChromiumBugfix';
import {
  CodeBlockElement,
  CodeLineBlockElement,
  ImageBlockElement,
  LayoutBlockElement,
  LayoutItemBlockElement,
  LinkInlineElement,
  MusicBlockElement,
  VideoBlockElement,
  WhiteBoardBlockElement,
} from 'types/slate';
import ImageBlock from './elements/ImageBlock';
import { useMemo } from 'react';
import MusicBlock from './elements/MusicBlock';
import WhiteBoardBlock from './elements/WhiteBoardBlock';
import VideoBlock from './elements/VideoBlock';
import LinkInline from './elements/LinkInline';
// import CubeBlock from './elements/CubeBlock';
import BlockElementController from './components/BlockElementController';
import { BlockElementType, InlineElementType } from '@/lib/constants';
import LayoutBlock from './elements/LayoutBlock';
import LayoutItemBlock from './elements/LayoutItemBlock';
import CodeLineBlock from './elements/CodeLineBlock';

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  const editor = useSlate();

  const readOnly = useReadOnly();

  // const key = useMemo(() => {
  //   return ReactEditor.findPath(editor, element).join('-');
  // }, [editor, element]);

  const key = ReactEditor.findPath(editor, element).join('-');

  const isInline = useMemo(() => {
    return !!attributes['data-slate-inline'];
  }, [attributes]);

  const path = useMemo(() => {
    return ReactEditor.findPath(editor, element);
  }, [editor, element]);

  // 所有元素
  const elements = useMemo(() => {
    return {
      // 内敛元素
      [InlineElementType.CODE_SPAN]: (
        <code-span {...attributes}>
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </code-span>
      ),
      [InlineElementType.LINK]: (
        <LinkInline
          attributes={attributes}
          element={element as LinkInlineElement}>
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </LinkInline>
      ),
      // 块级元素
      [BlockElementType.PARAGRAPH]: <p {...attributes}>{children}</p>,
      [BlockElementType.HEADING_1]: (
        <h1 {...attributes} id={key}>
          {children}
        </h1>
      ),
      [BlockElementType.HEADING_2]: (
        <h2 {...attributes} id={key}>
          {children}
        </h2>
      ),
      [BlockElementType.HEADING_3]: (
        <h3 {...attributes} id={key}>
          {children}
        </h3>
      ),
      [BlockElementType.HEADING_4]: (
        <h4 {...attributes} id={key}>
          {children}
        </h4>
      ),
      [BlockElementType.HEADING_5]: (
        <h5 {...attributes} id={key}>
          {children}
        </h5>
      ),
      [BlockElementType.HEADING_6]: (
        <h6 {...attributes} id={key}>
          {children}
        </h6>
      ),
      [BlockElementType.OL_LIST]: <ol {...attributes}>{children}</ol>,
      [BlockElementType.UL_LIST]: <ul {...attributes}>{children}</ul>,
      [BlockElementType.LIST_ITEM]: <li {...attributes}>{children}</li>,
      [BlockElementType.BLOCK_QUOTE]: (
        <blockquote {...attributes}>{children}</blockquote>
      ),
      [BlockElementType.CODE_BLOCK]: (
        <CodeBlock
          attributes={attributes}
          element={props.element as CodeBlockElement}>
          {children}
        </CodeBlock>
      ),
      [BlockElementType.CODE_LINE_BLOCK]: (
        <CodeLineBlock
          attributes={attributes}
          element={props.element as CodeLineBlockElement}>
          {children}
        </CodeLineBlock>
      ),
      [BlockElementType.LAYOUT]: (
        <LayoutBlock
          attributes={attributes}
          element={props.element as LayoutBlockElement}>
          {children}
        </LayoutBlock>
      ),
      [BlockElementType.LAYOUT_ITEM]: (
        <LayoutItemBlock
          attributes={attributes}
          element={props.element as LayoutItemBlockElement}>
          {children}
        </LayoutItemBlock>
      ),
      [BlockElementType.IMAGE]: (
        <ImageBlock
          attributes={attributes}
          element={element as ImageBlockElement}>
          {children}
        </ImageBlock>
      ),
      [BlockElementType.VIDEO]: (
        <VideoBlock
          attributes={attributes}
          element={element as VideoBlockElement}>
          {children}
        </VideoBlock>
      ),
      [BlockElementType.BUTTON]: <button {...attributes}>{children}</button>,
      [BlockElementType.MUSIC]: (
        <MusicBlock
          attributes={attributes}
          element={element as MusicBlockElement}>
          {children}
        </MusicBlock>
      ),
      [BlockElementType.WHITE_BOARD]: (
        <WhiteBoardBlock
          attributes={attributes}
          element={element as WhiteBoardBlockElement}>
          {children}
        </WhiteBoardBlock>
      ),
      // [BlockElementType.CUBE]: (
      //   <CubeBlock
      //     attributes={attributes}
      //     element={element as CubeBlockElement}>
      //     {children}
      //   </CubeBlock>
      // ),
    };
  }, [attributes, children, element, key, props.element]);

  const elementRender = useMemo(() => {
    if (isInline || readOnly || path.length > 1) {
      return elements[element.type] || <p {...attributes}>{children}</p>;
    }
    return (
      <BlockElementController element={element} id={key}>
        {elements[element.type] || <p {...attributes}>{children}</p>}
      </BlockElementController>
    );
  }, [
    isInline,
    readOnly,
    path.length,
    key,
    element,
    elements,
    attributes,
    children,
  ]);

  return elementRender;
};

export default Element;
