import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlate,
} from 'slate-react';
import { memo, useMemo } from 'react';
import Draggable from '../Draggable';
import { EDITOR_TO_TYPE_TO_COMPONENT } from '@/lib/constants';
import Selectable from '../Selectable';

const Element = memo((props: RenderElementProps) => {
  const { attributes, element } = props;

  const editor = useSlate();

  const readOnly = useReadOnly();

  const path = ReactEditor.findPath(editor, element);

  const elementKey = useMemo(() => path.join('-'), [path]);

  const isInline = useMemo(
    () => !!attributes['data-slate-inline'],
    [attributes]
  );

  // 所有元素
  const elementMap = useMemo(() => {
    const typeToComponentMap = EDITOR_TO_TYPE_TO_COMPONENT.get(editor);
    const result: Record<string, any> = {};
    const keys = Object.keys(typeToComponentMap || {});
    keys.forEach(key => {
      const Tag = typeToComponentMap?.[key];
      if (!Tag) return;
      let component = (
        <Selectable element={element} path={path}>
          <Tag {...props} />
        </Selectable>
      );
      if (isInline || readOnly || path.length > 1) {
        result[key] = component;
        return;
      }
      component = <Draggable id={elementKey}>{component}</Draggable>;
      result[key] = component;
    });
    return result;
  }, [editor, elementKey, isInline, path, props, readOnly, element]);

  return elementMap[element.type];
});

Element.displayName = 'Element';

export default Element;
