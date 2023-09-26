import {
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useStatus from './hooks/useStatus';
import clsx from 'clsx';

export interface MotionProps {
  restProps?: object;
  motionName?: string;
  visible?: boolean;
  transitionDuration?: number;
  onVisibleChanged?: (visible: boolean) => void;
  children?: (
    props: {
      visible?: boolean;
      className?: string;
      style?: React.CSSProperties;
      transitionDuration?: number;
      [key: string]: any;
    },
    ref: Ref<any>
  ) => React.ReactElement;
}

const Motion = forwardRef<any, MotionProps>((props, ref) => {
  const {
    restProps,
    motionName,
    visible = true,
    transitionDuration,
    onVisibleChanged,
    children,
  } = props;

  const [truthVisible, setTruthVisible] = useState(false);

  const calcTransitionDuration = useMemo(() => {
    return transitionDuration || 0;
  }, [transitionDuration]);

  const handleVisibleChanged = useCallback(
    (v: boolean) => {
      setTruthVisible(v);
      onVisibleChanged?.(v);
    },
    [onVisibleChanged]
  );

  useEffect(() => {
    onVisibleChanged?.(visible);
    handleVisibleChanged(visible);
  }, [visible, onVisibleChanged, handleVisibleChanged]);

  const [status, statusStep, isTransition, isActive] = useStatus(
    visible,
    calcTransitionDuration
  );

  return (
    <>
      {truthVisible || isTransition
        ? children?.(
            {
              ...{ visible, transitionDuration, ...restProps },
              className: clsx(motionName, {
                [`${motionName}-${status}-${statusStep}`]: isTransition,
                [`${motionName}-${status}-active`]: isTransition && isActive,
              }),
              style: isActive
                ? {
                    transition: transitionDuration + 's',
                  }
                : undefined,
            },
            ref
          )
        : null}
    </>
  );
});

Motion.displayName = 'Motion';

export default Motion;
