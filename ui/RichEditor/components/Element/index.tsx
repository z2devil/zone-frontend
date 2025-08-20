import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlate,
} from 'slate-react';
import { useMemo } from 'react';
import BlockElementController from './components/BlockElementController';
import { BlockElementType, EDITOR_TO_TYPE_TO_COMPONENT } from '@/lib/constants';

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  const editor = useSlate();

  const readOnly = useReadOnly();

  const key = ReactEditor.findPath(editor, element).join('-');

  const isInline = useMemo(
    () => !!attributes['data-slate-inline'],
    [attributes]
  );

  const path = useMemo(
    () => ReactEditor.findPath(editor, element),
    [editor, element]
  );

  const typeToComponentMap = useMemo(
    () => EDITOR_TO_TYPE_TO_COMPONENT.get(editor),
    [editor]
  );

  // 所有元素
  const elementMap = useMemo(() => {
    const result: Record<string, React.ReactNode> = {
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
      [BlockElementType.BUTTON]: <button {...attributes}>{children}</button>,
    };
    const keys = Object.keys(typeToComponentMap || {});
    keys.forEach(key => {
      const Component = typeToComponentMap?.[key];
      if (!Component) return;
      result[key] = (
        <Component {...attributes} element={element}>
          {children}
        </Component>
      );
    });
    console.log('[ result ]', result);
    return result;
  }, [attributes, children, element, key, typeToComponentMap]);

  const elementRender = useMemo(() => {
    if (isInline || readOnly || path.length > 1) {
      return elementMap[element.type] || <p {...attributes}>{children}</p>;
    }
    return (
      <BlockElementController element={element} id={key}>
        {elementMap[element.type] || <p {...attributes}>{children}</p>}
      </BlockElementController>
    );
  }, [
    isInline,
    readOnly,
    path.length,
    key,
    element,
    elementMap,
    attributes,
    children,
  ]);

  return elementRender;
};

export default Element;
