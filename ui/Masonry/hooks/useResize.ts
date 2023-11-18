import { RefObject, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash-es';

interface ResizeOptions {
  delay?: number;
}

const useResize = (
  target: Element | RefObject<Element>,
  options?: ResizeOptions
) => {
  const { delay = 100 } = options || {};

  // resizeObserver
  const resizeObserver = useRef<ResizeObserver>();
  // target 尺寸
  const [reat, setRect] = useState<DOMRect>();

  useEffect(() => {
    const dom = target instanceof Element ? target : target.current;
    if (!dom) return;

    resizeObserver.current = new ResizeObserver(
      throttle(() => {
        const reat = dom.getBoundingClientRect();
        setRect(reat);
      }, delay)
    );
    resizeObserver.current.observe(dom);

    return () => {
      resizeObserver.current?.disconnect
        ? resizeObserver.current.disconnect()
        : null;
    };
  }, [delay, target]);

  return [reat] as const;
};

export default useResize;
