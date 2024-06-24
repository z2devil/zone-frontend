'use client';

import clsx from 'clsx';
import {
  CSSProperties,
  MouseEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

interface ButtonProps {
  className?: string;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => Promise<any> | void;
}

const Button = (props: ButtonProps) => {
  const { className, children, onClick } = props;

  const [isLoading, setIsLoading] = useState(false);

  const clacStyle: CSSProperties = useMemo(() => {
    return {
      filter: isLoading ? 'grayscale(0.8) brightness(1.1)' : '',
    };
  }, [isLoading]);

  const handleClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      if (isLoading) return;
      if (!onClick) return;
      setIsLoading(true);
      await onClick(e);
      setIsLoading(false);
    },
    [isLoading, onClick]
  );

  return (
    <button
      className={clsx(className, 'overflow-hidden transition-all duration-100')}
      style={clacStyle}
      onClick={handleClick}>
      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-center transition-all duration-100',
          {
            'opacity-0': !isLoading,
          }
        )}>
        <i className='iconfont icon-spinner z-10 animate-spin text-2xl font-bold text-white'></i>
      </div>
      <div
        className={clsx(
          'flex items-center justify-center transition-all duration-100',
          {
            'opacity-0': isLoading,
          }
        )}>
        {children}
      </div>
    </button>
  );
};
export default Button;
