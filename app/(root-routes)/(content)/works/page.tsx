'use client';

import { FormEventHandler, useRef } from 'react';

const WorksPage = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  // const handleBeforeInput: FormEventHandler = e => {
  //   console.log(e);
  //   const { nativeEvent } = e;
  //   if (nativeEvent.type === 'keypress') {
  //     e.preventDefault();
  //   }
  // };

  const handleContentChange: FormEventHandler = e => {
    console.log(e);
  };

  return (
    <div
      ref={editorRef}
      className=' flex h-full w-full p-20'
      style={{
        height: 'calc(100vh - 3.625rem)',
      }}>
      <div className=' flex-1 overflow-y-auto rounded-xl bg-white'>
        <div
          className=' relative h-full w-full whitespace-break-spaces p-10 outline-none'
          style={{
            wordBreak: 'break-word',
            wordWrap: 'break-word',
          }}
          contentEditable
          spellCheck={false}
          tabIndex={1}
          onInput={handleContentChange}></div>
      </div>
    </div>
  );
};

export default WorksPage;
