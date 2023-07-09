'use client';

import { useEffect, useState } from 'react';
import dateFormat from 'utils/dateFormat';

interface DateDisplayProps {
  date: Date | string;
}

const DateDisplay = (props: DateDisplayProps) => {
  const { date } = props;

  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    if (typeof date === 'string') {
      setDateStr(dateFormat(new Date(date)));
    } else {
      setDateStr(dateFormat(date));
    }
  }, [date]);

  return <span>{dateStr}</span>;
};

export default DateDisplay;
