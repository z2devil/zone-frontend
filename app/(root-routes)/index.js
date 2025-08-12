/**
 * 写一个随机抽奖方法，输入抽奖次数，输出抽奖结果
下面为概率表，前面是物品，后面是概率
A 50%
B 25%
C 20%
D 4%
E 1%
物品D如果连续79次都没抽出，则第80次必出；
物品E如果连续179次都没抽出，则第180次必出；
抽出物品E后，会清空物品D的保底计数信息；
 */

// 基础概率配置 [物品, 概率]
const itemsInput = [
  ['A', 0.5],
  ['B', 0.25],
  ['C', 0.2],
  ['D', 0.04],
  ['E', 0.01],
];

function main(count, items) {
  // 累积概率计算
  let calc = 0;
  let rangeItems = {};
  items.map(([item, prob]) => {
    const start = calc;
    calc += prob;
    const val = { item, start, end: calc };
    rangeItems[item[0]] = val;
  });

  console.log('[ rangeItems ]', rangeItems);

  let calcD = 0;
  let calcE = 0;

  const results = [];

  const chouqu = () => {
    if (calcE === 179) {
      results.push(rangeItems['E']);
      calcE = 0;
      calcD = 0;
      return;
    }
    if (calcD === 79) {
      results.push(rangeItems['D']);
      calcD = 0;
      return;
    }

    const random = Math.random();

    console.log('[ random ]', random);

    for (const range of Object.values(rangeItems)) {
      if (range.start < random && random <= range.end) {
        results.push(range.item);
        calcE += 1;
        calcD += 1;

        if (range.item[0] === 'E') {
          calcE = 0;
          calcD = 0;
        } else if (range.item[0] === 'D') {
          calcD = 0;
        }
      }
    }
  };

  new Array(count).fill(0).forEach(chouqu);

  return results;
}

console.log('[ res ]', main(80, itemsInput));
