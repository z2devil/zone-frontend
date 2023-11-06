export interface MasonryRecord {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum MasonryUpdateDataType {
  ADD,
  REMOVE,
  UPDATE,
}

export interface containerRectInfo {
  width: number;
  windowHeight: number;
  scrollTop: number;
}

export type masonryRenderInfo = readonly [MasonryRecord[], number, string[]];

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

  constructor(
    coloumnCount: number,
    preRenderAreaDOM: HTMLElement,
    containerRect: containerRectInfo,
    options?: {
      bufferOffset?: number;
      gap?: number;
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
    this.reclacRecords();
    this.updateVisionTop();
    const renderIds = this.render();
    return [this.records, this.totalHeight, renderIds];
  }

  // 更新数据
  public async updateData(
    type: MasonryUpdateDataType,
    ids: string[]
  ): Promise<masonryRenderInfo> {
    const actions = {
      [MasonryUpdateDataType.ADD]: async () => {
        await this.preRender(ids);
      },
      [MasonryUpdateDataType.REMOVE]: async () => {
        await this.preRender(ids);
      },
      [MasonryUpdateDataType.UPDATE]: async () => {
        await this.preRender(ids);
      },
    };

    await actions[type]();
    this.updateVisionTop();
    const renderIds = this.render();

    return [this.records, this.totalHeight, renderIds];
  }

  public onScroll(scrollTop: number): masonryRenderInfo {
    this.containerRect.scrollTop = scrollTop;
    this.updateVisionTop();
    const renderIds = this.render();
    return [this.records, this.totalHeight, renderIds];
  }

  // 更新视窗顶部
  private updateVisionTop() {
    this.visionTop = -this.containerRect.scrollTop;
  }

  // 重新计算记录
  private reclacRecords() {
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

  // 预渲染
  private preRender(ids: string[]) {
    this.records.push(
      ...ids.map(id => {
        return {
          id,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        };
      })
    );

    return new Promise<null>(resolve => {
      if (!this.preRenderAreaDOM) throw new Error('preRender area missing');
      const preRenderAreaDOM = this.preRenderAreaDOM;
      const coloumnCount = this.coloumnCount;
      const columnHeights = this.columnHeights;
      const containerWidth = this.containerRect.width;
      const gap = this.gap;
      const records = this.records;

      const preRenderResizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const cardDOM = entry.target;
          const id = cardDOM.getAttribute('data-id');
          const record = records.find(record => record.id === id);
          if (!record) continue;
          const rect = cardDOM.children[0].getBoundingClientRect();
          const height = rect.height;
          const minIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const wrapperWidth = coloumnCount * (rect.width + gap) - gap;
          record.x =
            minIndex * (rect.width + gap) + (containerWidth - wrapperWidth) / 2;
          record.y = columnHeights[minIndex];
          record.width = rect.width;
          record.height = height;
          columnHeights[minIndex] += height + gap;
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

  // 渲染
  private render() {
    const visionTop = this.visionTop;
    const bufferOffset = this.bufferOffset;
    const containerHeight = this.containerRect.windowHeight;

    const visionRange = [
      visionTop - bufferOffset,
      visionTop + containerHeight + bufferOffset,
    ];

    const renderIds: string[] = [];

    this.records.forEach(record => {
      if (
        record.y + record.height > visionRange[0] &&
        record.y < visionRange[1]
      ) {
        renderIds.push(record.id);
      }
    });

    return renderIds;
  }
}

export default MasonyCore;
