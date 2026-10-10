import { lstatSync } from 'node:fs';

// prettier 遇到显式传入的符号链接会直接报错（.claude/skills 下均为指向 .codex/skills 的链接）
const withoutSymlinks = files =>
  files.filter(file => {
    try {
      return !lstatSync(file).isSymbolicLink();
    } catch {
      return true;
    }
  });

const quote = file => JSON.stringify(file);

export default {
  '*': files => {
    const targets = withoutSymlinks(files);
    return targets.length
      ? [
          `npx prettier --ignore-unknown --write ${targets.map(quote).join(' ')}`,
        ]
      : [];
  },
  './**/*.{js,ts,jsx,tsx,vue}': ['npx eslint --fix'],
};
