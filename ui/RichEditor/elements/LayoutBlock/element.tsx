import { useReadOnly } from 'slate-react';
import { LayoutBlockElement } from 'types/slate';
import LayoutEdit from './components/Edit';
import style from './style.module.scss';
import { OverrideProvider } from './components/OverrideProvider';
import { useMemo, useRef } from 'react';

interface LayoutBlockProps {
  attributes: any;
  children: any;
  element: LayoutBlockElement;
}

const LayoutBlock = ({ attributes, children, element }: LayoutBlockProps) => {
  const readOnly = useReadOnly();

  const containerRef = useRef<HTMLDivElement>(null);

  const widths = useMemo(() => {
    return element.children.map(child => child.width);
  }, [element.children]);

  return (
    <div {...attributes} className={style.layout}>
      <OverrideProvider containerRef={containerRef} widths={widths}>
        <div className={style.container}>{children}</div>
        <div className={style.edit} ref={containerRef}>
          {!readOnly ? <LayoutEdit element={element} /> : null}
        </div>
      </OverrideProvider>
    </div>
  );
};

export default LayoutBlock;
