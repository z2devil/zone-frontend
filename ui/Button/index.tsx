'use client';

import clsx from 'clsx';
import {
  ButtonHTMLAttributes,
  CSSProperties,
  MouseEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  className?: string;
  children?: ReactNode;
  loading?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => Promise<unknown> | void;
}

const Button = (props: ButtonProps) => {
  const {
    className,
    children,
    disabled,
    loading = false,
    onClick,
    type = 'button',
    ...buttonProps
  } = props;

  const [isInternalLoading, setIsInternalLoading] = useState(false);

  const isLoading = loading || isInternalLoading;

  const clacStyle: CSSProperties = useMemo(() => {
    return {
      filter: isLoading ? 'grayscale(0.8) brightness(1.1)' : '',
    };
  }, [isLoading]);

  const handleClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      if (isLoading) return;
      if (!onClick) return;
      setIsInternalLoading(true);
      try {
        await onClick(e);
      } finally {
        setIsInternalLoading(false);
      }
    },
    [isLoading, onClick]
  );

  return (
    <button
      {...buttonProps}
      aria-busy={isLoading || undefined}
      className={clsx(className, 'overflow-hidden transition-all duration-100')}
      disabled={disabled || isLoading}
      style={clacStyle}
      type={type}
      onClick={onClick ? handleClick : undefined}>
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
