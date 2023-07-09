'use client';

'use client';

import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

const Button = (props: ButtonProps) => {
  const { children, className, isLoading, isDisabled, onClick } = props;

  const handleClick = () => {
    if (isDisabled) return;
    onClick?.();
  };

  return (
    <button
      className={clsx(
        'box-border flex items-center justify-center gap-2 rounded-xl border border-transparent p-2.5 text-black-600 transition-colors duration-200 hover:border-border-color hover:bg-background-color-100 hover:text-black-900',
        className
      )}
      onClick={handleClick}>
      {isLoading ? (
        <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-black-900'></div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
