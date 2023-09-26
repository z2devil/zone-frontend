import { Key } from 'react';

export enum EnityStatus {
  ADD = 'add',
  REMOVE = 'remove',
}

export interface KeyEntity {
  key: Key;
  status?: EnityStatus;
  [name: string]: any;
}

// 转换keys
const parseKeys = (keys: (Key | { key: Key; [name: string]: any })[]) => {
  return keys.map((v: Key | { key: Key; [name: string]: any }) => {
    if (v && typeof v === 'object') {
      return v;
    } else {
      return {
        key: v,
      };
    }
  });
};

// 更新curkeys
const updateKeys = (prevKeys: KeyEntity[], curKeys: KeyEntity[]) => {
  let res: KeyEntity[] = [];
  let curIdx = 0;
  const curLen = curKeys.length;

  prevKeys.forEach(prevKey => {
    let hit = false;

    for (let i = 0; i < curLen; i++) {
      const curKey = curKeys[i];
      if (curKey.key === prevKey.key) {
        if (curIdx < i) {
          res = res.concat(
            curKeys
              .slice(curIdx, i)
              .map(v => ({ ...v, statu: EnityStatus.ADD }))
          );
          curIdx = i;
        }
        res.push({ ...curKey });
        curIdx++;
        hit = true;
        break;
      }
    }

    if (!hit) {
      res.push({
        ...prevKey,
        status: EnityStatus.REMOVE,
      });
    }
  });

  if (curIdx < curLen) {
    res = res.concat(
      curKeys.slice(curIdx).map(v => ({ ...v, status: EnityStatus.ADD }))
    );
  }

  // key字典
  const keys: Record<Key, number> = {};
  res.forEach(({ key }) => {
    keys[key] = (keys[key] || 0) + 1;
  });

  // 重复的key
  const duplicatedKeys = Object.keys(keys).filter(v => keys[v] > 1);
  // 将重复的key去掉
  duplicatedKeys.forEach(matchKey => {
    // 将重复的key和status为remove的key去掉
    res = res.filter(
      ({ key, status }) => key !== matchKey || status !== EnityStatus.REMOVE
    );
  });

  // 去除上一次状态为status的项
  res = res.filter(entity => {
    const prevEntity = prevKeys.find(({ key }) => entity.key === key);
    if (
      prevEntity &&
      prevEntity.status === EnityStatus.REMOVE &&
      entity.status === EnityStatus.REMOVE
    ) {
      return false;
    }
    return true;
  });

  return res;
};

export { parseKeys, updateKeys };
