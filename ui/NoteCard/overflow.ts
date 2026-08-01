interface OverflowMetrics {
  clientHeight: number;
  scrollHeight: number;
}

const OVERFLOW_EPSILON = 1;

export const isContentOverflowing = ({
  clientHeight,
  scrollHeight,
}: OverflowMetrics) => scrollHeight - clientHeight > OVERFLOW_EPSILON;
