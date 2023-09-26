import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { MotionStatus, MotionStepStatus } from '../constant';
import useNextFrame from './useNextFrame';

const useStatus = (
  visible: boolean,
  duration = 0
): [MotionStatus, MotionStepStatus, boolean, boolean] => {
  const [status, setStatus] = useState<MotionStatus>(MotionStatus.NONE);
  const [step, setStep] = useState<MotionStepStatus>(MotionStepStatus.NONE);
  const [isTransition, setIsTransition] = useState(false);
  const [isActive, setActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const [nextFrame] = useNextFrame();

  const update = useCallback(() => {
    setStatus(visible ? MotionStatus.ENTER : MotionStatus.LEAVE);
    setStep(MotionStepStatus.FROM);
    clearTimeout(timerRef.current);
    duration && setIsTransition(true);
    nextFrame(() => {
      setStep(MotionStepStatus.TO);
      setActive(true);
      timerRef.current = setTimeout(() => {
        duration && setIsTransition(false);
        setActive(false);
        clearTimeout(timerRef.current);
      }, duration * 1000);
    });
  }, [visible, duration, nextFrame]);

  useLayoutEffect(() => {
    update();
  }, [visible, duration, update]);

  return [status, step, isTransition, isActive];
};

export default useStatus;
