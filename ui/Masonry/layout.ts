export interface MasonryGeometry {
  cardWidth: number;
  columnCount: number;
  contentOffset: number;
  contentWidth: number;
}

const DEFAULT_ESTIMATED_ITEM_HEIGHT = 480;
const MIN_ITEMS_PER_LANE = 2;
const MAX_ITEMS_PER_LANE = 10;

export const calculateMasonryOverscan = (
  bufferOffset: number,
  columnCount: number,
  averageEstimatedItemHeight: number
) => {
  const safeColumnCount = Math.max(1, Math.floor(columnCount));
  const safeBufferOffset = Math.max(0, bufferOffset);
  const safeAverageHeight =
    Number.isFinite(averageEstimatedItemHeight) &&
    averageEstimatedItemHeight > 0
      ? averageEstimatedItemHeight
      : DEFAULT_ESTIMATED_ITEM_HEIGHT;
  const itemsPerLane = Math.min(
    MAX_ITEMS_PER_LANE,
    Math.max(
      MIN_ITEMS_PER_LANE,
      Math.ceil(safeBufferOffset / safeAverageHeight)
    )
  );

  return itemsPerLane * safeColumnCount;
};

export const calculateMasonryGeometry = (
  containerWidth: number,
  preferredCardWidth: number,
  gap: number
): MasonryGeometry => {
  const safeContainerWidth = Math.max(0, containerWidth);
  const safeCardWidth = Math.max(0, preferredCardWidth);
  const safeGap = Math.max(0, gap);

  if (safeContainerWidth === 0 || safeCardWidth === 0) {
    return {
      cardWidth: 0,
      columnCount: 1,
      contentOffset: 0,
      contentWidth: 0,
    };
  }

  const cardWidth = Math.min(safeContainerWidth, safeCardWidth);
  const columnCount = Math.max(
    1,
    Math.floor((safeContainerWidth + safeGap) / (safeCardWidth + safeGap))
  );
  const contentWidth = columnCount * cardWidth + (columnCount - 1) * safeGap;

  return {
    cardWidth,
    columnCount,
    contentOffset: Math.max(0, (safeContainerWidth - contentWidth) / 2),
    contentWidth,
  };
};
