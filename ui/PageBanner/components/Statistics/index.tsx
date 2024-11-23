'use client';

import { getStatisticsAPI } from '@/lib/api/statistics';
import useRequest from '@/lib/hooks/useRequest';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface StatisticsProps {
  containerWidth: number;
  onClose: () => void;
}

const DEFAULT_ITEMS = [
  {
    title: '笔记',
    unit: '篇',
    value: 0,
    icon: 'icon-uil_file-copy-alt',
  },
  {
    title: '文字',
    unit: '个',
    value: 0,
    icon: 'icon-char',
  },
  {
    title: '阅读',
    unit: '次',
    value: 0,
    icon: 'icon-eye',
  },
];

const MAX_WIDTH = 768;

const DIAGRAM_OPTIONS = {
  0: '#ebedf0',
  5: '#9be9a8',
  10: '#40c463',
  15: '#30a14e',
  20: '#216e39',
};

const getDiagramColor = (count: number) => {
  const keys = Object.keys(DIAGRAM_OPTIONS).map(Number);
  const key = keys.find(key => count <= key) ?? keys[keys.length - 1];
  return DIAGRAM_OPTIONS[key as keyof typeof DIAGRAM_OPTIONS];
};

const numberFormat = new Intl.NumberFormat();

const getMonthsAndDaysInYear = (year: number) => {
  const months = [];

  for (let month = 0; month < 12; month++) {
    // 获取该月的天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    months.push({
      month: month + 1,
      days: daysInMonth,
    });
  }

  return months;
};

const Statistics = (props: StatisticsProps) => {
  const { containerWidth, onClose } = props;

  const [request] = useRequest();

  const [items, setItems] = useState(DEFAULT_ITEMS);

  const [contributions, setContributions] = useState<
    {
      date: number;
      count: number;
    }[]
  >([]);

  const [currentYear, setCurrentYear] = useState<number>();

  const contributionYears = useMemo(() => {
    return Array.from(
      new Set(
        contributions.map(contribution =>
          new Date(contribution.date).getFullYear()
        )
      )
    ).reverse();
  }, [contributions]);

  const contributionMonths = useMemo(() => {
    const res: {
      month: number;
      contributions: {
        date: string;
        count: number;
      }[];
    }[] = [];

    if (!currentYear) return res;

    // 将贡献按日期存储到一个对象中以便快速查找
    const contributionMap = contributions.reduce(
      (acc, contribution) => {
        const date = new Date(contribution.date).toLocaleDateString();
        acc[date] = contribution.count;
        return acc;
      },
      {} as Record<string, number>
    );

    getMonthsAndDaysInYear(currentYear).forEach(month => {
      res.push({
        month: month.month,
        contributions: new Array(month.days).fill(0).map((_, index) => {
          const date = new Date(
            currentYear,
            month.month - 1,
            index + 1
          ).toLocaleDateString();
          return {
            date,
            count: contributionMap[date] || 0,
          };
        }),
      });
    });

    return res;
  }, [contributions, currentYear]);

  const loadStatistics = useCallback(async () => {
    const res = await getStatisticsAPI(request)();
    setItems(items => {
      items[0].value = res.noteCount;
      items[1].value = res.wordCount;
      items[2].value = res.viewCount;
      return [...items];
    });
    setContributions(res.contributes);
  }, [request]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  useEffect(() => {
    if (!contributionYears.length) return;
    setCurrentYear(contributionYears[0]);
  }, [contributionYears]);

  return (
    <>
      <div
        className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-black-80 bg-gray-100'
        onClick={onClose}>
        <span className='iconfont icon-angle-left !text-black-600'></span>
      </div>
      {/* 数据统计 */}
      <div className='w-full'>
        <div
          className={clsx(
            'mt-4 flex w-full gap-2',
            containerWidth < MAX_WIDTH ? 'flex-col' : ''
          )}>
          {items.map((item, index) => (
            <div
              className='relative flex flex-1 flex-col overflow-hidden rounded-lg border border-black-80 bg-gray-100 p-4'
              key={index}>
              <div className='flex items-center gap-1'>
                <span className='text-3xl font-bold text-primary-50'>
                  {numberFormat.format(item.value)}
                </span>
                <span className='mt-2 text-xs text-gray-600'>{item.unit}</span>
              </div>
              <span className='text-17 text-gray-600'>{item.title}</span>
              <span
                className={clsx(
                  'iconfont absolute right-0 top-0 translate-x-1/3 transform text-[128px] leading-[128px] text-primary-50 opacity-10',
                  item.icon
                )}></span>
            </div>
          ))}
        </div>
      </div>
      {/* 贡献图 */}
      <div className='w-full'>
        <div
          className={clsx(
            'mt-4 flex w-full gap-2 overflow-hidden rounded-lg border border-black-80 bg-gray-100 p-4',
            containerWidth < MAX_WIDTH ? 'flex-col' : ''
          )}>
          {/* 年份 */}
          <div
            className={clsx(
              'flex flex-shrink-0 gap-5',
              containerWidth < MAX_WIDTH ? '' : 'flex-col'
            )}>
            {contributionYears.map((year, index) => (
              <div
                className={clsx(
                  'flex cursor-pointer items-center gap-1 text-black-250 transition-colors duration-100 hover:text-primary-100',
                  {
                    'text-primary-50': year === currentYear,
                  }
                )}
                key={index}
                onClick={() => setCurrentYear(year)}>
                <div className='relative top-[1px] text-15'>{year}年</div>
                <div className='iconfont icon-angle-right'></div>
              </div>
            ))}
          </div>
          {/* 数据 */}
          <div className='scrollbar relative grid flex-1 grid-flow-col grid-rows-[repeat(7,12px)] gap-1 overflow-auto pb-6 pl-7'>
            {contributionMonths.map((monthInfo, i) => {
              const contributions = monthInfo.contributions.map(
                (contribution, j) => {
                  const date = new Date(contribution.date);
                  const weekDayNum = date.getDay();
                  const weekDayStr = date.toLocaleString('zh-CN', {
                    weekday: 'short',
                  });
                  return (
                    <div
                      className='h-3 w-3 overflow-hidden rounded-sm'
                      key={`${i}-${j}`}
                      style={{
                        backgroundColor: getDiagramColor(contribution.count),
                      }}
                      title={`${contribution.date}：${contribution.count}篇`}>
                      {i === 0 && j < 7 && [1, 3, 5].includes(weekDayNum) && (
                        <div className='absolute left-0 flex flex-col gap-1 whitespace-nowrap'>
                          <div className='text-xs text-black-250'>
                            {weekDayStr}
                          </div>
                        </div>
                      )}
                      {j === 0 && (
                        <div className='absolute bottom-1 flex flex-col gap-1 whitespace-nowrap'>
                          <div className='text-xs text-black-250'>
                            {monthInfo.month}月
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              );

              if (monthInfo.month === 1) {
                if (!currentYear) return contributions;
                const span = new Date(currentYear, 0, 1).getDay();
                const emptyDays = new Array(span)
                  .fill(0)
                  .map((_, j) => (
                    <div
                      className='h-3 w-3 overflow-hidden rounded-sm'
                      key={`empty-${j}`}></div>
                  ));
                return [...emptyDays, ...contributions];
              }

              return contributions;
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
