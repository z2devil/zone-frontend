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
  return keys.map(key => {
    if (key && typeof key === 'object') {
      return key;
    } else {
      return {
        key,
      };
    }
  });
};

// 更新curkeys
const updateKeys = (prevKeys: KeyEntity[], nextKeys: KeyEntity[]) => {
  let res: KeyEntity[] = [];
  let nextIndex = 0;
  const nextKeysLength = nextKeys.length;

  prevKeys.forEach(prevKey => {
    let hit = false;

    for (let i = 0; i < nextKeysLength; i++) {
      const nextKey = nextKeys[i];
      if (nextKey.key === prevKey.key) {
        if (nextIndex < i) {
          res = res.concat(
            nextKeys
              .slice(nextIndex, i)
              .map(v => ({ ...v, status: EnityStatus.ADD }))
          );
          nextIndex = i;
        }
        res.push({ ...nextKey });
        nextIndex++;
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

  if (nextIndex < nextKeysLength) {
    res = res.concat(
      nextKeys.slice(nextIndex).map(v => ({ ...v, status: EnityStatus.ADD }))
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
