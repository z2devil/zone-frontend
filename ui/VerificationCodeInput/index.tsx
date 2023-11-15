'use client';

import { ClipboardEvent, KeyboardEvent, useRef, useState } from 'react';
import { produce } from 'immer';

interface VerificationCodeInputProps {
  length: number;
  onChange: (code: string) => void;
}

const SupportInputRegExp = /^[0-9]*$/;

const VerificationCodeInput = (props: VerificationCodeInputProps) => {
  const { length, onChange } = props;

  const [code, setCode] = useState(Array(length).fill(''));

  const containerRef: React.RefObject<HTMLDivElement> = useRef(null);

  // 输入变化
  const handleChange = (index: number, value: string) => {
    const containerDOM = containerRef.current;
    if (!containerDOM) return;

    const inputDOMs =
      containerDOM.children as HTMLCollectionOf<HTMLInputElement>;
    const nextIndex = index + (value === '' ? -1 : 1);
    const nextValue = code[nextIndex];

    if (nextIndex >= 0 && nextIndex < index) {
      inputDOMs[nextIndex]?.focus();
    }
    if (nextIndex < length && nextIndex > index && nextValue === '') {
      inputDOMs[nextIndex]?.focus();
    }

    setCode(
      produce(code, draft => {
        draft[index] = value;
        onChange(draft.join(''));
      })
    );
  };

  // 粘贴
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    const pastedCode = pastedData.slice(0, length).split('');

    setCode(
      produce(code, draft => {
        pastedCode.forEach((value, index) => {
          draft[index] = value;
        });
      })
    );
  };

  // 按键监听
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const { key, target } = e;
    const containerDOM = containerRef.current;
    if (!containerDOM) return;

    const inputDOMs =
      containerDOM.children as HTMLCollectionOf<HTMLInputElement>;

    const index = Array.from(inputDOMs).indexOf(target as HTMLInputElement);

    switch (key) {
      case 'Backspace':
        {
          e.preventDefault();
          handleChange(index, '');
        }
        break;
      case 'ArrowLeft':
        {
          inputDOMs[index - 1]?.focus();
        }
        break;
      case 'ArrowRight':
        {
          inputDOMs[index + 1]?.focus();
        }
        break;
      default: {
        if (!SupportInputRegExp.test(key)) {
          e.preventDefault();
          return;
        }
        handleChange(index, key);
      }
    }
  };

  return (
    <div ref={containerRef} className=' flex gap-[1.25rem]'>
      {code.map((value, index) => (
        <input
          className='flex h-[3.25rem] w-[3.25rem] rounded-xl text-center text-lg font-medium text-black-900'
          key={index}
          type='text'
          value={value}
          onChange={() => void 0}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          maxLength={1}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;
