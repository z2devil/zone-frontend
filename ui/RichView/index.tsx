import { memo, useEffect, useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import { Slate as SlateProvider, withReact } from 'slate-react';
import clsx from 'clsx';
import { isEqual } from 'lodash';
import { BlockElementType } from '@/lib/constants';
import RichEditor from '../RichEditor';
import { autoImport } from '../RichEditor/utils';

interface EditorProps {
  className?: string;
  value: Descendant[];
  isSummary?: boolean;
}

const RichView = (props: EditorProps) => {
  const {
    className,
    value = [
      {
        type: BlockElementType.PARAGRAPH,
        children: [
          {
            text: '',
          },
        ],
      },
    ],
    isSummary,
  } = props;

  const editor = useMemo(() => {
    const enhancers = [withReact];
    const res = enhancers.reduce((e, enhancer) => enhancer(e), createEditor());
    if (isSummary) {
      res.isSummary = true;
    }
    const modulesContext = require.context(
      '@/features/', // 目录路径
      true, // 递归子目录
      /\/index\.ts$/ // 匹配 index.ts 文件
    );
    // 自动导入
    const features = autoImport<any>(modulesContext);
    console.log(features);
    return res;
  }, [isSummary]);

  useEffect(() => {
    if (value) {
      editor.children = value;
    }
  }, [value, editor]);

  return (
    <div className={clsx('relative flex flex-col', className)}>
      <SlateProvider editor={editor} initialValue={value}>
        <RichEditor readonly />
      </SlateProvider>
    </div>
  );
};

RichView.displayName = 'RichView';

export default memo(RichView, (prev, next) => isEqual(prev, next));
