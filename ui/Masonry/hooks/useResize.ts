import { RefObject, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash-es';
import px2number from '@/lib/utils/px2number';
import { CARD_WIDTH, GAP } from '../constants';

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

  // container 尺寸
  const [containerReat, setContainerRect] = useState<DOMRect>();

  // column
  const [column, setColumn] = useState(2);

  useEffect(() => {
    const dom = target instanceof Element ? target : target.current;
    if (!dom) return;

    resizeObserver.current = new ResizeObserver(
      throttle(
        () => {
          const containerReat = dom.getBoundingClientRect();
          setContainerRect(containerReat);

          const style = getComputedStyle(dom);
          const containerWidth =
            px2number(style.width) -
            px2number(style.paddingLeft) -
            px2number(style.paddingRight);

          if (containerWidth < CARD_WIDTH) {
            setColumn(1);
            return;
          }

          const column = Math.floor(
            (containerWidth + GAP) / (CARD_WIDTH + GAP)
          );
          setColumn(column);
        },
        delay,
        {
          trailing: true,
        }
      )
    );
    resizeObserver.current.observe(dom);

    return () => {
      resizeObserver.current?.disconnect
        ? resizeObserver.current.disconnect()
        : null;
    };
  }, [delay, target]);

  return [containerReat, column] as const;
};

export default useResize;
