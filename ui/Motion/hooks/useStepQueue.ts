import { useLayoutEffect, useState } from 'react';
import { MotionStatus, MotionStepStatus } from '../constant';
import useNextFrame from './useNextFrame';

const STEP_QUEUE: MotionStepStatus[] = [
  MotionStepStatus.FROM,
  MotionStepStatus.TO,
];

const useStepQueue = (
  status: MotionStatus,
  callback: (step: MotionStepStatus) => Promise<void> | void | boolean
): [() => void, MotionStepStatus] => {
  const [step, setStep] = useState<MotionStepStatus>(MotionStepStatus.NONE);

  const [nextFrame] = useNextFrame();

  const startQueue = () => {
    setStep(MotionStepStatus.FROM);
  };

  useLayoutEffect(() => {
    if (step === MotionStepStatus.NONE) return;
    const index = STEP_QUEUE.indexOf(step);
    const nextStep = STEP_QUEUE[index + 1];
    if (!nextStep) return;
    const result = callback(step);
    if (result === false) {
      setStep(nextStep);
    } else {
      nextFrame(() => {
        if (result === true) {
          setStep(nextStep);
        } else {
          Promise.resolve(result).then(() => {
            setStep(nextStep);
          });
        }
      });
    }
  }, [status, step, callback, nextFrame]);

  return [startQueue, step];
};

export default useStepQueue;
