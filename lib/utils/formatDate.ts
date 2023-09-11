/**
 * 人性化时间处理 (传入时间戳)
 */
const arrr = ['年', '个月', '周', '天', '小时', '分钟', '秒'];
const arrn = [31536000, 2592000, 604800, 86400, 3600, 60, 1];
export function beautifyTime(timestamp: number) {
  const mistiming = Math.abs((Date.now() - timestamp) / 1000);
  for (let i = 0; i < 7; i++) {
    const inm = Math.floor(mistiming / arrn[i]);
    if (inm) return inm + arrr[i] + (mistiming > 0 ? '前' : '后');
  }
}

// // 时间格式为 2020.08.09
// export function timestampToData(strDate) {
//     var date = new Date(strDate);
//     var Y = date.getFullYear() + '.';
//     var M =
//         (date.getMonth() + 1 < 10
//             ? '0' + (date.getMonth() + 1)
//             : date.getMonth() + 1) + '.';
//     var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '';
//     return Y + M + D;
// }

// 时间格式为 2020-08-09
export function timestampToData(timestamp: number, separator = '-') {
  const date = new Date(timestamp);
  const Y = date.getFullYear();
  const M =
    date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '';
  return `${Y}${separator}${M}${separator}${D}`;
}

// 时间格式为 2020-08-09 06:05:04
export function timestampToTime(timestamp: number) {
  const date = new Date(timestamp);
  const Y = date.getFullYear() + '-';
  const M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-';
  const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  const h =
    (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  const m =
    (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
    ':';
  const s =
    date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return Y + M + D + h + m + s;
}

// // 时间格式为 2020年08月09日 06:05:04
// export function timestampToTimeByStr(strDate) {
//     var date = new Date(strDate);
//     var Y = date.getFullYear() + '年';
//     var M =
//         (date.getMonth() + 1 < 10
//             ? '0' + (date.getMonth() + 1)
//             : date.getMonth() + 1) + '月';
//     var D =
//         (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '日 ';
//     var h =
//         (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
//     var m =
//         (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
//         ':';
//     var s =
//         date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
//     return Y + M + D + h + m + s;
// }
