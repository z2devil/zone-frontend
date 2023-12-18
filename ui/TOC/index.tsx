import clsx from 'clsx';
import TOCTree from './components/Tree';
import { twMerge } from 'tailwind-merge';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BlockElementType } from '../RichEditor/constans';
import { ReactEditor, useSlate } from 'slate-react';

export interface TOCTreeItem {
  label: string;
  path: number[];
  children?: TOCTreeItem[];
}

interface TOCProps {
  className?: string;
}

const TOC = (props: TOCProps) => {
  const { className } = props;

  const editor = useSlate();

  const [toc, setToc] = useState<TOCTreeItem | null>(null);

  const [activePath, setActivePath] = useState<number[]>([]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const init = useCallback(() => {
    if (!editor.children.length) return;

    const toc: TOCTreeItem = {
      label: 'root',
      path: [],
      children: [],
    };

    const currentPath = Array(6).fill(null);

    const typeToLevel: Record<string, number> = {
      [BlockElementType.HEADING_1]: 1,
      [BlockElementType.HEADING_2]: 2,
      [BlockElementType.HEADING_3]: 3,
      [BlockElementType.HEADING_4]: 4,
      [BlockElementType.HEADING_5]: 5,
      [BlockElementType.HEADING_6]: 6,
    };

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const path = entry.target.id.split('-').map(item => +item);
            setActivePath(path);
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    editor.children.forEach(child => {
      const level = child.type ? typeToLevel[child.type] : null;

      if (!level) return;

      const nextChild: TOCTreeItem = {
        label: child.children?.[0].text || '',
        path: ReactEditor.findPath(editor, child),
      };

      currentPath[level - 1] = nextChild;

      for (let i = level; i < currentPath.length; i++) {
        currentPath[i] = null;
      }

      let parent = toc;
      for (let i = 0; i < level - 1; i++) {
        if (currentPath[i]) {
          if (!currentPath[i].children) {
            currentPath[i].children = [];
          }
          parent = currentPath[i];
        }
      }

      parent.children = parent.children || [];
      parent.children.push(nextChild);

      const nodeDOM = ReactEditor.toDOMNode(editor, child);

      if (!nodeDOM) return;

      observer.observe(nodeDOM);
    });

    observerRef.current = observer;

    setToc(toc);
    console.log('[ toc ]', toc);
  }, [editor]);

  useEffect(() => {
    init();
  }, [init]);

  if (!toc || !toc.children?.length) return null;

  return (
    <div
      className={clsx(
        twMerge(
          ' flex w-52 shrink-0 flex-col divide-y divide-black-50 rounded-xl bg-gray-100 shadow-main',
          className
        )
      )}>
      {toc.children.map((item, index) => (
        <TOCTree key={index} data={item} activePath={activePath} />
      ))}
    </div>
  );
};

export default TOC;
