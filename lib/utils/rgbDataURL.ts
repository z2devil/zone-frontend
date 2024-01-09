// Pixel GIF code adapted from https://stackoverflow.com/a/33919020/266535

const DEFAULT_COLORS = [
  [108, 149, 177],
  [156, 190, 205],
  [192, 204, 213],
  [237, 233, 219],
];

const KEY_STR =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const triplet = (e1: number, e2: number, e3: number) =>
  KEY_STR.charAt(e1 >> 2) +
  KEY_STR.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  KEY_STR.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  KEY_STR.charAt(e3 & 63);

export const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

export const getRandomRgbDataURL = () => {
  const [r, g, b] =
    DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
  return rgbDataURL(r, g, b);
};
