'use client';

import CustomEditor from '@/ui/CustomEditor';

const WorksPage = () => {
  return (
    <div
      className=' flex h-full w-full p-20'
      style={{
        height: 'calc(100vh - 3.625rem)',
      }}>
      <CustomEditor className=' rounded-xl bg-white' />
    </div>
  );
};

export default WorksPage;
