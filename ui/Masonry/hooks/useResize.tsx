import { RefObject, useEffect, useRef, useState } from 'react';
import _ from 'lodash';

const useResize = (target: Element | RefObject<Element>) => {
  // resizeObserver
  const resizeObserver = useRef<ResizeObserver>();
  // target 尺寸
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const dom = target instanceof Element ? target : target.current;
    if (!dom) return;

    resizeObserver.current = new ResizeObserver(
      _.throttle(() => {
        const { width, height } = dom.getBoundingClientRect();
        setSize({ width, height });
      }, 100)
    );
    resizeObserver.current.observe(dom);

    return () => {
      resizeObserver.current?.disconnect
        ? resizeObserver.current.disconnect()
        : null;
    };
  }, [target]);

  return [size] as const;
};

export default useResize;
