'use client';

import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

interface VerificationCodeInputProps {
  length: number;
  onChange: (code: string) => void;
}

const VerificationCodeInput = (props: VerificationCodeInputProps) => {
  const { length, onChange } = props;

  const [code, setCode] = useState<string[]>(Array(length).fill(''));

  const [isPreventCompositing, setIsPreventCompositing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (index: number, value: string) => {
      const updatedCode = [...code];
      updatedCode[index] = value;

      setCode(updatedCode);
      onChange(updatedCode.join(''));

      // Focus the next or previous input
      const nextIndex = index + (value === '' ? -1 : 1);
      const containerDOM = containerRef.current;
      if (containerDOM) {
        const inputDOMs =
          containerDOM.children as HTMLCollectionOf<HTMLInputElement>;
        if (nextIndex >= 0 && nextIndex < length) {
          inputDOMs[nextIndex]?.focus();
        }
      }
    },
    [code, length, onChange]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData('text/plain')
        .trim()
        .slice(0, length);

      const updatedCode = [...code];
      [...pastedData].forEach((value, index) => {
        if (index < length) {
          updatedCode[index] = value;
        }
      });

      setCode(updatedCode);
      onChange(updatedCode.join(''));
    },
    [code, length, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const { key, target } = e;
      const containerDOM = containerRef.current;
      if (!containerDOM) return;

      const inputDOMs =
        containerDOM.children as HTMLCollectionOf<HTMLInputElement>;
      const index = Array.from(inputDOMs).indexOf(target as HTMLInputElement);

      switch (key) {
        case 'Backspace':
          e.preventDefault();
          handleChange(index, '');
          break;
        case 'ArrowLeft':
          if (index > 0) {
            inputDOMs[index - 1]?.focus();
          }
          break;
        case 'ArrowRight':
          if (index < length - 1) {
            inputDOMs[index + 1]?.focus();
          }
          break;
      }
    },
    [handleChange, length]
  );

  const handleInput = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      if (isPreventCompositing) {
        e.preventDefault();
        setIsPreventCompositing(false);
        return;
      }

      const { target } = e;
      const value = (target as HTMLInputElement).value;

      // 只接受数字
      if (value && !/^[0-9]*$/.test(value)) {
        e.preventDefault();
        return;
      }

      const index = Array.from(
        containerRef.current?.children as HTMLCollectionOf<HTMLInputElement>
      ).indexOf(target as HTMLInputElement);
      handleChange(index, value.slice(0, 1));
    },
    [handleChange, isPreventCompositing]
  );

  const handleCompositionStart = useCallback(() => {
    setIsPreventCompositing(true);
  }, []);

  return (
    <div className='flex gap-[1.25rem]' ref={containerRef}>
      {code.map((value, index) => (
        <input
          aria-label={`Verification code input ${index + 1}`}
          autoFocus={index === 0}
          className='flex h-[3.25rem] w-[3.25rem] rounded-xl text-center text-lg font-medium text-black-900'
          key={index}
          maxLength={1}
          type='text'
          value={value}
          onCompositionStartCapture={handleCompositionStart}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;
