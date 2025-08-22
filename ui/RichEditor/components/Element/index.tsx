import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlate,
} from 'slate-react';
import { useMemo } from 'react';
import BlockElementController from './components/BlockElementController';
import { EDITOR_TO_TYPE_TO_COMPONENT } from '@/lib/constants';

const Element = (props: RenderElementProps) => {
  const { attributes, element } = props;

  const editor = useSlate();

  const readOnly = useReadOnly();

  const elementKey = useMemo(
    () => ReactEditor.findPath(editor, element).join('-'),
    [editor, element]
  );

  const isInline = useMemo(
    () => !!attributes['data-slate-inline'],
    [attributes]
  );

  const path = useMemo(
    () => ReactEditor.findPath(editor, element),
    [editor, element]
  );

  // 所有元素
  const elementMap = useMemo(() => {
    const typeToComponentMap = EDITOR_TO_TYPE_TO_COMPONENT.get(editor);
    const result: Record<string, any> = {};
    const keys = Object.keys(typeToComponentMap || {});
    keys.forEach(key => {
      const Tag = typeToComponentMap?.[key];
      if (!Tag) return;
      if (isInline || readOnly || path.length > 1) {
        result[key] = <Tag {...props} />;
      }
      result[key] = (
        <BlockElementController id={elementKey}>
          <Tag {...props} />
        </BlockElementController>
      );
    });
    return result;
  }, [editor, elementKey, isInline, path.length, props, readOnly]);

  return elementMap[element.type] || null;
};

export default Element;
