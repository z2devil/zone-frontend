import clsx from 'clsx';

const enum MenuKey {
  SEARCH,
  MORE,
}

const MENU = [
  {
    key: MenuKey.SEARCH,
    name: '搜索',
    icon: 'icon-search',
  },
  {
    key: MenuKey.MORE,
    name: '更多',
    icon: 'icon-bars',
  },
];

const RootHeader = () => {
  return (
    <div className='sticky top-0 z-30 flex h-[3.625rem] w-full items-center justify-between border-b border-gray-300 bg-gray-50 bg-opacity-90 px-5 backdrop-blur-xl'>
      <i className='iconfont icon-logo text-[2rem] text-black-900'></i>
      <div className='flex items-center gap-[0.63rem]'>
        {MENU.map(item => {
          return (
            <button key={item.key}>
              <i
                className={clsx(
                  'iconfont p-[0.5rem] text-2xl text-black-900',
                  item.icon
                )}></i>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RootHeader;
