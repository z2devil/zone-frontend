'use client';

import CustomEditor from '@/ui/CustomEditor';
import { ElementType } from '@/ui/CustomEditor/constans';
import { Descendant } from 'slate';

const WorksPage = () => {
  return (
    <div
      className=' flex h-full w-full p-20'
      style={{
        height: 'calc(100vh - 3.625rem)',
      }}>
      <CustomEditor
        className=' rounded-xl bg-white'
        initialValue={initialValue}
      />
    </div>
  );
};

const initialValue: Descendant[] = [
  {
    type: ElementType.PARAGRAPH,
    children: [
      {
        type: ElementType.TEXT,
        text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: ElementType.BLOCK_QUOTE,
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: ElementType.PARAGRAPH,
    children: [
      {
        type: ElementType.TEXT,
        text: 'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: ElementType.HEADING_2,
    children: [
      {
        type: ElementType.TEXT,
        text: 'Try it out!',
      },
    ],
  },
  {
    type: ElementType.PARAGRAPH,
    children: [
      {
        type: ElementType.TEXT,
        text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
];

export default WorksPage;
