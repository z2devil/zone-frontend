'use client';

import CustomEditor from '@/ui/CustomEditor';
import { BlockElementType } from '@/ui/CustomEditor/constans';
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
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: BlockElementType.BLOCK_QUOTE,
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: 'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: BlockElementType.HEADING_2,
    children: [
      {
        text: 'Try it out!',
      },
    ],
  },
  {
    type: BlockElementType.PARAGRAPH,
    children: [
      {
        text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
];

export default WorksPage;
