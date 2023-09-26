import {
  Key,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';

export enum NoticeType {
  SUCCESS,
  ERROR,
  WARNING,
}

export interface NotificationProps {
  uuid: Key;
  type?: NoticeType;
  content?: ReactNode;
  closable?: boolean;
  duration?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onClose?: (uuid: Key) => void;
}

const ICONS = {
  [NoticeType.SUCCESS]: 'icon-success-filled',
  [NoticeType.ERROR]: 'icon-error-filled',
  [NoticeType.WARNING]: 'icon-warning-filled',
};

const ICON_COLORS = {
  [NoticeType.SUCCESS]: 'text-[#04D700] text-opacity-60',
  [NoticeType.ERROR]: 'text-[#D70000] text-opacity-60',
  [NoticeType.WARNING]: 'text-[#D7CE00] text-opacity-60',
};

const Notification = (props: NotificationProps) => {
  const {
    uuid,
    type = NoticeType.SUCCESS,
    content = '',
    closable = false,
    duration = 5,
    onClick,
    onClose,
  } = props;

  const calcIconClassName = useMemo(() => {
    return `${ICONS[type]} ${ICON_COLORS[type]}`;
  }, [type]);

  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    console.log('[ uuid ]', uuid);
  }, [uuid]);

  useEffect(() => {
    console.log('[ onClose ]', onClose);
  }, [onClose]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!hovering && duration > 0) {
      timer = setTimeout(() => {
        onClose?.(uuid);
      }, duration * 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [duration, hovering, uuid, onClose]);

  const handleClose = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClose?.(uuid);
    },
    [uuid, onClose]
  );

  return (
    <div
      className='notification flex h-12 items-center justify-between gap-10 rounded-full border border-gray-50 bg-white pl-4 pr-5 shadow-main'
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}>
      <div className='flex items-center gap-2'>
        <i className={clsx('iconfont text-2xl', calcIconClassName)}></i>
        <span>{content}</span>
      </div>
      {closable && (
        <button
          className='flex items-center justify-center'
          onClick={handleClose}>
          <i className='iconfont icon-error text-2xl text-black-600 transition-colors duration-100 hover:text-black-900'></i>
        </button>
      )}
    </div>
  );
};

export default Notification;
