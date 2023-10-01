import { forwardRef, Ref, useLayoutEffect, useMemo, useState } from 'react';

export interface MotionProps {
  restProps?: object;
  visible?: boolean;
  transitionDuration?: number;
  children?: (
    props: {
      visible?: boolean;
      style?: React.CSSProperties;
      transitionDuration?: number;
      enterIn?: boolean;
      leaveOut?: boolean;
      [key: string]: any;
    },
    ref: Ref<any>
  ) => React.ReactElement;
}

const Motion = forwardRef<any, MotionProps>((props, ref) => {
  const { restProps, visible = true, transitionDuration = 0, children } = props;

  const [truthVisible, setTruthVisible] = useState(false);

  const [enterIn, setEnterIn] = useState(false);

  const [leaveOut, setLeaveOut] = useState(false);

  const [isTransition, setIsTransition] = useState(false);

  const calcStyle = useMemo(() => {
    return isTransition
      ? {
          transition: transitionDuration + 's',
        }
      : undefined;
  }, [isTransition, transitionDuration]);

  useLayoutEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        setTruthVisible(true);
        setEnterIn(true);
        requestAnimationFrame(() => {
          setEnterIn(false);
          setIsTransition(true);
        });
      });
    } else {
      setLeaveOut(true);
      setIsTransition(true);
    }
    const timer = setTimeout(() => {
      setTruthVisible(visible);
      setEnterIn(false);
      setLeaveOut(false);
      setIsTransition(false);
    }, transitionDuration * 1000);
    return () => {
      clearTimeout(timer);
      setIsTransition(false);
    };
  }, [visible, transitionDuration]);

  return (
    <>
      {truthVisible
        ? children?.(
            {
              visible,
              transitionDuration,
              enterIn,
              leaveOut,
              style: calcStyle,
              ...restProps,
            },
            ref
          )
        : null}
    </>
  );
});

Motion.displayName = 'Motion';

export default Motion;
