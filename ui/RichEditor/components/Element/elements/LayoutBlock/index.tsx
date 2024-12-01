import { useReadOnly } from 'slate-react';
import { LayoutBlockElement } from 'types/slate';
import LayoutEdit from './components/Edit';
import style from './style.module.scss';
import { OverrideProvider } from './components/OverrideProvider';
import { useMemo, useRef } from 'react';

interface MusicBlockProps {
  attributes: any;
  children: any;
  element: LayoutBlockElement;
}

const LayoutBlock = ({ attributes, children, element }: MusicBlockProps) => {
  const readOnly = useReadOnly();

  const containerRef = useRef<HTMLDivElement>(null);

  const widths = useMemo(() => {
    return element.children.map(child => child.width);
  }, [element.children]);

  return (
    <div {...attributes}>
      <OverrideProvider containerRef={containerRef} initialWidths={widths}>
        <div className={style.layout} ref={containerRef}>
          {!readOnly ? <LayoutEdit element={element} /> : null}
          {children}
        </div>
      </OverrideProvider>
    </div>
  );
};

export default LayoutBlock;
