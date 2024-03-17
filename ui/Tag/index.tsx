import clsx from 'clsx';

interface TagProps {
  children: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
}

const Tag = (props: TagProps) => {
  const { children, checked, onClick } = props;

  return (
    <div
      className={clsx(
        ' relative inline-flex h-8 cursor-pointer items-center justify-center rounded-full border bg-gray-50 px-4 text-17 transition-colors duration-100',
        checked
          ? 'border-primary-50 font-medium text-primary-50'
          : ' border-transparent text-black-400 hover:border-black-250 hover:text-black-600'
      )}
      onClick={onClick}>
      {children}
    </div>
  );
};

export default Tag;
