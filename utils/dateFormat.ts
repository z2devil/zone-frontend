export enum DateUnit {
  SECOND = '秒',
  MINUTE = '分',
  HOUR = '小时',
  DAY = '日',
  MONTH = '月',
  YEAR = '年',
}

enum DateDirection {
  BEFORE = '前',
  AFTER = '后',
}

const dateFormat = (date: Date, unit?: DateUnit): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffDate = new Date(diff);
  const year = diffDate.getFullYear() - 1970;
  const month = diffDate.getMonth();
  const day = diffDate.getDate() - 1;
  const hour = diffDate.getHours();
  const minute = diffDate.getMinutes();
  const second = diffDate.getSeconds();
  const dateMap = [
    { unit: DateUnit.SECOND, value: second },
    { unit: DateUnit.MINUTE, value: minute },
    { unit: DateUnit.HOUR, value: hour },
    { unit: DateUnit.DAY, value: day },
    { unit: DateUnit.MONTH, value: month },
    { unit: DateUnit.YEAR, value: year },
  ];

  if (unit) {
    const dateObj = dateMap.find(item => item.unit === unit);
    if (dateObj) {
      return `${dateObj.value}${dateObj.unit}${DateDirection.BEFORE}`;
    }
  } else {
    const dateObj = dateMap.find(item => item.value > 0);
    if (dateObj) {
      return `${dateObj.value}${dateObj.unit}${DateDirection.BEFORE}`;
    }
  }
  return '刚刚';
};

export default dateFormat;
