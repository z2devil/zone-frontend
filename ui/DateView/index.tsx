'use client';

import { useEffect, useState } from 'react';
import dateFormat from 'utils/dateFormat';

interface DateViewProps {
  date: Date | string;
  className?: string;
}

const DateView = (props: DateViewProps) => {
  const { date } = props;

  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    if (typeof date === 'string') {
      setDateStr(dateFormat(new Date(date)));
    } else {
      setDateStr(dateFormat(date));
    }
  }, [date]);

  return <span className={props.className}>{dateStr}</span>;
};

export default DateView;
