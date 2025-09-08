import { Plugin } from './plugin';

type PluginResults = { [key: string]: Plugin };

/**
 * 自动导入
 * @param context 上下文
 * @returns 导入结果
 */
export function autoImportPlugins(): PluginResults {
  const context = require.context(
    '@/ui/RichEditor/elements',
    true,
    /^\.\/[^/]+\/index\.ts$/
  );

  const keys = context.keys();
  const result: PluginResults = {};

  keys.forEach((key: string) => {
    const dirName = key.split('/')[1];
    const mod = context(key);
    result[dirName] = mod.default || mod;
  });

  return result;
}
