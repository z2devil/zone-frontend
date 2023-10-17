import { ElementType } from 'types';
import { ShortcustType } from 'types/slate';

export const SHORTCUTS = {
  [ElementType.LIST_ITEM]: ['*', '-', '+'],
  [ElementType.BLOCK_QUOTE]: ['>'],
  [ElementType.HEADING_1]: ['#'],
  [ElementType.HEADING_2]: ['##'],
  [ElementType.HEADING_3]: ['###'],
  [ElementType.HEADING_4]: ['####'],
  [ElementType.HEADING_5]: ['#####'],
  [ElementType.HEADING_6]: ['######'],
};

export const SHORTCUTS_MAP: Record<string, ShortcustType> = (() => {
  const map: Record<string, ShortcustType> = {};

  Object.entries(SHORTCUTS).forEach(([type, chars]) => {
    chars.forEach(char => {
      map[char] = type as ShortcustType;
    });
  });

  return map;
})();
