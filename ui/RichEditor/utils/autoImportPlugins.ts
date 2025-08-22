import { ElementPlugin } from './elementPlugin';

type ElementPluginResults = { [key: string]: ElementPlugin };

/**
 * 自动导入
 * @param context 上下文
 * @returns 导入结果
 */
export function autoImportPlugins(): ElementPluginResults {
  const context = require.context(
    '@/ui/RichEditor/elements',
    true,
    /^\.\/[^/]+\/index\.ts$/
  );

  const keys = context.keys();
  const result: ElementPluginResults = {};

  keys.forEach((key: string) => {
    const dirName = key.split('/')[1];
    const mod = context(key);
    result[dirName] = mod.default || mod;
  });

  return result;
}
