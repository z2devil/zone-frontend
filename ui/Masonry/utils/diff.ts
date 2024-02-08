import { isEqual } from 'lodash';

export type MasonryRecord = {
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
};

const patchRecords = (
  records: MasonryRecord[],
  prevIdx: number,
  nextIdx: number
) => {
  const prevRecord = records[prevIdx];
  const nextRecord = records[nextIdx];
  // console.log('patchRecords', prevRecord, nextRecord);
  if (!isEqual(prevRecord, nextRecord)) {
    records[prevIdx] = nextRecord;
  }
};

export const diffAndUpdateRecords = (
  records: MasonryRecord[],
  prev: any[],
  next: any[],
  keyField: string
) => {
  const res: string[] = [];

  // 初始化映射表，便于快速查找记录
  const recordsMap = new Map(records.map(item => [item[keyField], item]));

  let prevStartIdx = 0,
    prevEndIdx = prev.length - 1;
  let nextStartIdx = 0,
    nextEndIdx = next.length - 1;
  let prevStartItem = prev[prevStartIdx],
    prevEndItem = prev[prevEndIdx];
  let nextStartItem = next[nextStartIdx],
    nextEndItem = next[nextEndIdx];

  while (prevStartIdx <= prevEndIdx && nextStartIdx <= nextEndIdx) {
    if (prevStartItem[keyField] === nextStartItem[keyField]) {
      // 更新操作
      patchRecords(records, prevStartIdx, nextStartIdx);
      prevStartItem = prev[++prevStartIdx];
      nextStartItem = next[++nextStartIdx];
    } else if (prevEndItem[keyField] === nextEndItem[keyField]) {
      // 更新操作
      patchRecords(records, prevEndIdx, nextEndIdx);
      prevEndItem = prev[--prevEndIdx];
      nextEndItem = next[--nextEndIdx];
    } else if (prevEndItem[keyField] === nextStartItem[keyField]) {
      // 将prevEnd对应的元素移动到prevStart
      patchRecords(records, prevEndIdx, nextStartIdx);
      prevEndItem = prev[--prevEndIdx];
      nextStartItem = next[++nextStartIdx];
    } else if (prevStartItem[keyField] === nextEndItem[keyField]) {
      // 将prevStart对应的元素移动到prevEnd
      patchRecords(records, prevStartIdx, nextEndIdx);
      prevStartItem = prev[++prevStartIdx];
      nextEndItem = next[--nextEndIdx];
    } else {
      // 处理新增或删除的情况
      if (!recordsMap.has(nextStartItem[keyField])) {
        // 新增
        records.push(nextStartItem);
        recordsMap.set(nextStartItem[keyField], nextStartItem);
        res.push(nextStartItem[keyField]);
      }
      // 假设删除操作已通过其它方式处理
      nextStartItem = next[++nextStartIdx];
    }
  }

  // 处理仍然未匹配的新元素（新增）
  while (nextStartIdx <= nextEndIdx) {
    const newItem = next[nextStartIdx++];
    if (!recordsMap.has(newItem[keyField])) {
      records.push({
        [keyField]: newItem[keyField],
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      res.push(newItem[keyField]);
    }
  }

  // 删除在next中不存在的元素
  const nextKeys = new Set(next.map(item => item[keyField]));
  const toRemoveIndices: any[] = [];
  records.forEach((record, index) => {
    if (!nextKeys.has(record[keyField])) {
      toRemoveIndices.push(index);
    }
  });
  for (let i = toRemoveIndices.length - 1; i >= 0; i--) {
    records.splice(toRemoveIndices[i], 1);
  }

  return res;
};
