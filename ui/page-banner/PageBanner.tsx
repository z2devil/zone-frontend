import DateDisplay from '../date-display/DateDisplay';
import Button from '../button/Button';

interface PageBannerProps {
  title: string;
  lastUpdated: string;
}

const PageBanner = (props: PageBannerProps) => {
  const { title, lastUpdated } = props;

  return (
    <div className='flex w-full flex-col items-start justify-start pt-5'>
      <div className='text-[4rem] font-semibold text-black-900'>{title}</div>
      <div className='flex w-full items-center justify-between'>
        <div className='text-[1.125rem] text-black-400'>
          <span>最近更新：</span>
          <DateDisplay date={lastUpdated} />
        </div>
        <div className='flex items-start justify-start gap-2.5'>
          <Button>
            <i className='iconfont icon-search block h-5 w-5 text-[1.25rem] leading-5' />
          </Button>
          <Button>
            <i className='iconfont icon-chart block h-5 w-5 text-[1.25rem] leading-5' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageBanner;
