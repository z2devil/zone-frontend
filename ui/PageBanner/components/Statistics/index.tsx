'use client'

import { getStatisticsAPI } from "@/lib/api/statistics";
import useRequest from "@/lib/hooks/useRequest";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  }
]

const MAX_WIDTH = 768;

const DIAGRAM_OPTIONS = {
  0: '#ebedf0',
  5: '#9be9a8',
  10: '#40c463',
  15: '#30a14e',
  20: '#216e39'
}

const getDiagramColor = (count: number) => {
  const keys = Object.keys(DIAGRAM_OPTIONS).map(Number);
  const key = keys.find(key => count <= key) ?? keys[keys.length - 1];
  return DIAGRAM_OPTIONS[key as keyof typeof DIAGRAM_OPTIONS];
}

const numberFormat = new Intl.NumberFormat();

const getMonthsAndDaysInYear = (year: number) => {
  const months = [];

  for (let month = 0; month < 12; month++) {
    // 获取该月的天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    months.push({
      month: month + 1,
      days: daysInMonth
    });
  }

  return months;
};

const Statistics = (props: StatisticsProps) => {
  const { containerWidth, onClose } = props;

  const [request] = useRequest();

  const [items, setItems] = useState(DEFAULT_ITEMS);

  const [contributions, setContributions] = useState<{
    date: number;
    count: number;
  }[]>([]);

  const [currentYear, setCurrentYear] = useState<number>();

  const contributionYears = useMemo(() => {
    return Array.from(new Set(contributions.map(contribution => new Date(contribution.date).getFullYear()))).reverse()
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
    const contributionMap = contributions.reduce((acc, contribution) => {
      const date = new Date(contribution.date).toLocaleDateString();
      acc[date] = contribution.count;
      return acc;
    }, {} as Record<string, number>);

    console.log('[ contributionMap ]', contributionMap);
  
    getMonthsAndDaysInYear(currentYear).forEach(month => {
      res.push({
        month: month.month,
        contributions: new Array(month.days).fill(0).map((_, index) => {
          const date = new Date(currentYear, month.month - 1, index + 1).toLocaleDateString();
          console.log('[ date ]', date);
          return {
            date,
            count: contributionMap[date] || 0
          };
        })
      });
    });
  
    return res;
  }, [contributions, currentYear]);

  const loadStatistics = useCallback(async () => {
    const res = await getStatisticsAPI(request)();
    setItems((items) => {
      items[0].value = res.noteCount;
      items[1].value = res.wordCount;
      items[2].value = res.viewCount;
      return [...items];
    });
    setContributions(res.contributes);
  }, [request])

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics])

  useEffect(() => {
    if (!contributionYears.length) return;
    setCurrentYear(contributionYears[0]);
  }, [contributionYears])

  return (
    <>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 border border-black-80 cursor-pointer" onClick={onClose}>
        <span className="iconfont icon-angle-left !text-black-600"></span>
      </div>
      {/* 数据统计 */}
      <div className="w-full">
        <div className={clsx('gap-2 mt-4 w-full flex', 
            containerWidth < MAX_WIDTH ? 'flex-col' : ''
          )}>
          {items.map((item, index) => (
            <div className="flex flex-1 flex-col bg-gray-100 border border-black-80 p-4 rounded-lg overflow-hidden relative" key={index}>
              <div className="flex gap-1 items-center">
                <span className="text-3xl font-bold text-primary-50">{numberFormat.format(item.value)}</span>
                <span className="text-xs text-gray-600 mt-2">{item.unit}</span>
              </div>
              <span className="text-17 text-gray-600">{item.title}</span>
              <span className={clsx('iconfont text-[128px] absolute text-primary-50 opacity-10 top-0 right-0 transform translate-x-1/3 leading-[128px]', item.icon)}></span>
            </div>
          ))}
        </div>
      </div>
      {/* 贡献图 */}
      <div className="w-full">
        <div className={clsx('gap-2 mt-4 w-full flex bg-gray-100 border border-black-80 p-4 rounded-lg overflow-hidden', 
            containerWidth < MAX_WIDTH ? 'flex-col' : ''
          )}>
          {/* 年份 */}
          <div className={clsx('flex flex-shrink-0 gap-5', 
            containerWidth < MAX_WIDTH ? '' : 'flex-col'
          )}>
            {contributionYears.map((year, index) => (
              <div className={clsx('flex items-center gap-1 cursor-pointer text-black-250 hover:text-primary-100 duration-100 transition-colors', {
                'text-primary-50': year === currentYear
              })} key={index} onClick={() => setCurrentYear(year)}>
                <div className="text-15 relative top-[1px]">{year}年</div>
                <div className="iconfont icon-angle-right"></div>
              </div>
            ))}
          </div>
          {/* 数据 */}
          <div className="grid grid-rows-[repeat(7,12px)] grid-flow-col flex-1 overflow-auto gap-1 relative pb-6 pl-7 scrollbar">
          {contributionMonths.map((monthInfo, i) => {
            const contributions = monthInfo.contributions.map((contribution, j) => {
              const date = new Date(contribution.date);
              const weekDayNum = date.getDay();
              const weekDayStr = date.toLocaleString('zh-CN', { weekday: 'short' });
              return (<div
                className="w-3 h-3 rounded-sm overflow-hidden"
                key={`${i}-${j}`}
                style={{ backgroundColor: getDiagramColor(contribution.count) }}
                title={`${contribution.date}：${contribution.count}篇`}
              >
                {i === 0 && j < 7 && [1, 3, 5].includes(weekDayNum) && (
                  <div className="absolute left-0 flex flex-col gap-1 whitespace-nowrap">
                    <div className="text-xs text-black-250">{weekDayStr}</div>
                  </div>
                )}
                {j === 0 && (
                  <div className="absolute bottom-1 flex flex-col gap-1 whitespace-nowrap">
                    <div className="text-xs text-black-250">{monthInfo.month}月</div>
                  </div>
                )}
              </div>)
            });

            if (monthInfo.month === 1) {
              if (!currentYear) return contributions;
              const span = new Date(currentYear, 0, 1).getDay();
              const emptyDays = new Array(span).fill(0).map((_, j) => (
                <div className="w-3 h-3 rounded-sm overflow-hidden" key={`empty-${j}`}></div>
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
}

export default Statistics;