'use client';

import {
  ChangeEvent,
  ClipboardEvent,
  CompositionEvent,
  KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

interface VerificationCodeInputProps {
  disabled?: boolean;
  length: number;
  onChange: (code: string) => void;
}

const VerificationCodeInput = (props: VerificationCodeInputProps) => {
  const { disabled = false, length, onChange } = props;

  const [code, setCode] = useState<string[]>(Array(length).fill(''));

  const codeRef = useRef(code);

  const isComposingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (index: number, value: string) => {
      const updatedCode = [...codeRef.current];
      updatedCode[index] = value;

      codeRef.current = updatedCode;
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
    [length, onChange]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData('text/plain')
        .trim()
        .replace(/\D/g, '')
        .slice(0, length);

      const updatedCode = Array<string>(length).fill('');
      [...pastedData].forEach((value, index) => {
        if (index < length) {
          updatedCode[index] = value;
        }
      });

      codeRef.current = updatedCode;
      setCode(updatedCode);
      onChange(updatedCode.join(''));
    },
    [length, onChange]
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

  const updateFromInput = useCallback(
    (target: HTMLInputElement) => {
      const value = target.value;
      if (value && !/^\d+$/.test(value)) return;

      const index = Array.from(
        containerRef.current?.children as HTMLCollectionOf<HTMLInputElement>
      ).indexOf(target);
      if (index >= 0) handleChange(index, value.slice(-1));
    },
    [handleChange]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const nativeEvent = e.nativeEvent as InputEvent;
      if (isComposingRef.current || nativeEvent.isComposing) return;
      updateFromInput(e.currentTarget);
    },
    [updateFromInput]
  );

  const handleCompositionEnd = useCallback(
    (e: CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      updateFromInput(e.currentTarget);
    },
    [updateFromInput]
  );

  return (
    <div className='flex gap-[1.25rem]' ref={containerRef}>
      {code.map((value, index) => (
        <input
          aria-label={`Verification code input ${index + 1}`}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={index === 0}
          className='flex h-[3.25rem] w-[3.25rem] rounded-xl text-center text-lg font-medium text-black-900'
          disabled={disabled}
          inputMode='numeric'
          key={index}
          maxLength={1}
          type='text'
          value={value}
          onChange={handleInputChange}
          onCompositionEnd={handleCompositionEnd}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;
