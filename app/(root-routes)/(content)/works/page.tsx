'use client';

import Editor from '@/ui/Editor';

const WorksPage = () => {
  return (
    <div
      className=' flex h-full w-full p-20'
      style={{
        height: 'calc(100vh - 3.625rem)',
      }}>
      <Editor className=' rounded-xl bg-white' />
    </div>
  );
};

export default WorksPage;
