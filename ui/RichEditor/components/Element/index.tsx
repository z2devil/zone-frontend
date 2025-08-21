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
  const { attributes, element, children } = props;

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
    const result: Record<string, any> = {
      [BlockElementType.HEADING_1]: 'h1',
      [BlockElementType.HEADING_2]: 'h2',
      [BlockElementType.HEADING_3]: 'h3',
      [BlockElementType.HEADING_4]: 'h4',
      [BlockElementType.HEADING_5]: 'h5',
      [BlockElementType.HEADING_6]: 'h6',
      [BlockElementType.OL_LIST]: 'ol',
      [BlockElementType.UL_LIST]: 'ul',
      [BlockElementType.LIST_ITEM]: 'li',
      [BlockElementType.BLOCK_QUOTE]: 'blockquote',
      [BlockElementType.BUTTON]: 'button',
    };
    const keys = Object.keys(typeToComponentMap || {});
    keys.forEach(key => {
      const Component = typeToComponentMap?.[key];
      if (!Component) return;
      result[key] = Component;
    });
    return result;
  }, [typeToComponentMap]);

  const Tag = elementMap[element.type] || 'p';

  if (isInline || readOnly || path.length > 1) {
    return (
      <Tag {...attributes} element={element} id={key}>
        {children}
      </Tag>
    );
  }

  return (
    <BlockElementController id={key}>
      <Tag {...props} />
    </BlockElementController>
  );
};

export default Element;
