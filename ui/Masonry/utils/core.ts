export type MasonryRecord =
  | {
      x: number;
      y: number;
      width: number;
      height: number;
      [key: string]: any;
    }
  | undefined;

export interface containerRectInfo {
  width: number;
  windowHeight: number;
  scrollTop: number;
}

/**
 * @param records 记录
 * @param totalHeight 总高度
 * @param renderIndexes 渲染索引
 */
export type masonryRenderInfo = readonly [MasonryRecord[], number, number[]];

class MasonyCore {
  private coloumnCount: number;
  private visionTop = 0;
  private columnHeights: number[];
  private totalHeight = 0;
  private records: MasonryRecord[] = [];
  // 容器
  private containerRect: containerRectInfo;
  // 预渲染区
  private preRenderAreaDOM: HTMLElement | null;
  private preRenderResizeObserver: ResizeObserver | null;
  // 配置
  private bufferOffset: number;
  private gap: number;
  private keyField: string;

  constructor(
    coloumnCount: number,
    preRenderAreaDOM: HTMLElement,
    containerRect: containerRectInfo,
    options?: {
      bufferOffset?: number;
      gap?: number;
      keyField?: string;
    }
  ) {
    this.coloumnCount = coloumnCount;
    this.columnHeights = Array.from({ length: this.coloumnCount }, () => 0);
    // 容器
    this.containerRect = containerRect;
    // 预渲染区
    this.preRenderAreaDOM = preRenderAreaDOM;
    this.preRenderResizeObserver = null;
    // 配置
    this.bufferOffset = options?.bufferOffset || 0;
    this.gap = options?.gap || 0;
    this.keyField = options?.keyField || '_id';
  }

  // 销毁
  public destroy() {
    // 释放预渲染区
    this.preRenderAreaDOM = null;
    this.preRenderResizeObserver?.disconnect();
    this.preRenderResizeObserver = null;
  }

  // 重置
  public reset(
    coloumnCount?: number,
    containerRect?: containerRectInfo
  ): masonryRenderInfo {
    this.coloumnCount = coloumnCount || this.coloumnCount;
    this.containerRect = containerRect || this.containerRect;
    this.updateVisionTop();
    // this.calcSize(); 不计算尺寸
    this.calcPosition();
    const renderIndexes = this.calcRenderIndexes();
    return [this.records, this.totalHeight, renderIndexes];
  }

  // 渲染
  public async render(
    coloumnCount?: number,
    containerRect?: containerRectInfo
  ): Promise<masonryRenderInfo> {
    console.log('[ render ]', this.records);
    this.coloumnCount = coloumnCount || this.coloumnCount;
    this.containerRect = containerRect || this.containerRect;
    this.updateVisionTop();
    await this.calcSize();
    this.calcPosition();
    const renderIndexes = this.calcRenderIndexes();
    return [this.records, this.totalHeight, renderIndexes];
  }

  // 更新记录
  private patchRecord = (index: number, source: string | MasonryRecord) => {
    console.log('[ patchRecord ]', index, source);
    if (!source) return;
    if (typeof source === 'string') {
      const nextRecord = {
        [this.keyField]: source,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      this.records[index] = nextRecord;
    } else {
      const record = this.records[index];
      if (record) {
        Object.assign(record, source);
      } else {
        this.records[index] = source;
      }
    }
  };

  // 移动数据
  private moveRecord = (prevIndex: number, nextIndex: number) => {
    console.log('[ moveRecord ]', prevIndex, nextIndex);
    [this.records[prevIndex], this.records[nextIndex]] = [
      this.records[nextIndex],
      this.records[prevIndex],
    ];
  };

  // 删除记录
  private removeRecord = (index: number) => {
    console.log('[ removeRecord ]', index);
    const record = this.records[index];
    if (!record) return;
    this.records[index] = undefined;
    console.log('[ removeRecord ]', record[this.keyField]);
  };

  // 判断数据是否相同
  private isSameDataItem = (prevDataItem: any, nextDataItem: any) => {
    return prevDataItem[this.keyField] === nextDataItem[this.keyField];
  };

  // 更新数据
  public updateData(prevData: any[], nextData: any[], keyField: keyof any) {
    console.log('[ updateData ]', prevData, nextData);
    const needPreRenderIds: string[] = [];

    let prevStartIndex = 0;
    let prevEndIndex = prevData.length - 1;
    let nextStartIndex = 0;
    let nextEndIndex = nextData.length - 1;

    let prevStartItem = prevData[prevStartIndex];
    let prevEndItem = prevData[prevEndIndex];
    let nextStartItem = nextData[nextStartIndex];
    let nextEndItem = nextData[nextEndIndex];

    while (prevStartIndex <= prevEndIndex && nextStartIndex <= nextEndIndex) {
      if (!prevStartItem) {
        prevStartItem = prevData[++prevStartIndex];
      } else if (!prevEndItem) {
        prevEndItem = nextData[--prevEndIndex];
      } else if (this.isSameDataItem(prevStartItem, nextStartItem)) {
        this.patchRecord(nextStartIndex, nextStartItem[keyField]);
        needPreRenderIds.push(nextStartItem[keyField]);
        prevStartItem = prevData[++prevStartIndex];
        nextStartItem = nextData[++nextStartIndex];
      } else if (this.isSameDataItem(prevEndItem, nextEndItem)) {
        this.patchRecord(nextEndIndex, nextEndItem[keyField]);
        needPreRenderIds.push(nextEndItem[keyField]);
        prevEndItem = prevData[--prevEndIndex];
        nextEndItem = nextData[--nextEndIndex];
        console.log('[ records ]', JSON.parse(JSON.stringify(this.records)));
      } else if (this.isSameDataItem(prevStartItem, nextEndItem)) {
        this.moveRecord(prevStartIndex, nextEndIndex);
        prevStartItem = prevData[++prevStartIndex];
        nextEndItem = nextData[--nextEndIndex];
      } else if (this.isSameDataItem(prevEndItem, nextStartItem)) {
        this.moveRecord(prevEndIndex, nextStartIndex);
        prevEndItem = prevData[--prevEndIndex];
        nextStartItem = nextData[++nextStartIndex];
      } else {
        const indexInPrev = prevData.findIndex(prevItem =>
          this.isSameDataItem(prevItem, nextStartItem)
        );
        if (indexInPrev !== -1) {
          this.moveRecord(indexInPrev, nextStartIndex);
        } else {
          this.patchRecord(nextStartIndex, nextStartItem[keyField]);
          needPreRenderIds.push(nextStartItem[keyField]);
        }
        nextStartItem = nextData[++nextStartIndex];
      }
    }

    if (prevStartIndex > prevEndIndex) {
      for (let i = nextStartIndex; i <= nextEndIndex; i++) {
        this.patchRecord(i, nextData[i][keyField]);
        needPreRenderIds.push(nextData[i][keyField]);
      }
    } else if (nextStartIndex > nextEndIndex) {
      for (let i = prevStartIndex; i <= prevEndIndex; i++) {
        this.removeRecord(i);
      }
    }

    this.records = this.records.filter(Boolean);

    return needPreRenderIds;
  }

  // 更新视窗顶部
  private updateVisionTop() {
    this.visionTop = -this.containerRect.scrollTop;
  }

  // 滚动
  public onScroll(scrollTop: number): masonryRenderInfo {
    this.containerRect.scrollTop = scrollTop;
    this.updateVisionTop();
    const renderIndexes = this.calcRenderIndexes();
    return [this.records, this.totalHeight, renderIndexes];
  }

  // 计算位置
  private calcPosition() {
    const records = this.records;
    const coloumnCount = this.coloumnCount;
    const columnHeights = this.columnHeights;
    const containerWidth = this.containerRect.width;
    const gap = this.gap;

    columnHeights.length = 0;
    columnHeights.push(...Array.from({ length: coloumnCount }, () => 0));

    let nextTotalHeight = 0;
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (!record) throw new Error('record missing');
      const minIndex = columnHeights.indexOf(Math.min(...columnHeights));
      const wrapperWidth = coloumnCount * (record.width + gap) - gap;
      record.x =
        minIndex * (record.width + gap) + (containerWidth - wrapperWidth) / 2;
      record.y = columnHeights[minIndex];
      columnHeights[minIndex] += record.height + gap;
      nextTotalHeight = Math.max(nextTotalHeight, columnHeights[minIndex]);
    }
    this.totalHeight = nextTotalHeight;
  }

  // 计算尺寸(预渲染)
  private calcSize() {
    return new Promise<null>(resolve => {
      if (!this.preRenderAreaDOM) throw new Error('calcSize area missing');
      const preRenderAreaDOM = this.preRenderAreaDOM;
      const columnHeights = this.columnHeights;
      const gap = this.gap;
      const records = this.records;

      const preRenderResizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const cardDOM = entry.target;
          const id = cardDOM.getAttribute('data-id');
          const record = records.find(
            record => record && record[this.keyField] === id
          );
          if (!record) continue;
          const rect = cardDOM.children[0].getBoundingClientRect();
          const minIndex = columnHeights.indexOf(Math.min(...columnHeights));
          record.width = rect.width;
          record.height = rect.height;
          columnHeights[minIndex] += rect.height + gap;
        }
        this.totalHeight = Math.max(...columnHeights);
        preRenderResizeObserver.disconnect();
        resolve(null);
      });

      // bugfix: 解决预渲染刚开始时拿不到元素的问题
      requestAnimationFrame(() => {
        const cardDOMs = preRenderAreaDOM.children;
        for (let i = 0; i < cardDOMs.length; i++) {
          preRenderResizeObserver.observe(cardDOMs[i]);
        }

        this.preRenderResizeObserver = preRenderResizeObserver;
      });
    });
  }

  // 计算渲染索引
  private calcRenderIndexes() {
    const visionTop = this.visionTop;
    const bufferOffset = this.bufferOffset;
    const containerHeight = this.containerRect.windowHeight;
    const records = this.records;

    const visionRange = [
      visionTop - bufferOffset,
      visionTop + containerHeight + bufferOffset,
    ];

    const renderIndexes: number[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (!record) continue;
      if (
        record.y + record.height > visionRange[0] &&
        record.y < visionRange[1]
      ) {
        renderIndexes.push(i);
      }
    }

    return renderIndexes;
  }
}

export default MasonyCore;
