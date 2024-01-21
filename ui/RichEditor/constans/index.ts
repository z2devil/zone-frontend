import { ElementType, ShortcustType } from 'types/slate';

export enum MarkType {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  STRIKETHROUGH = 'strikethrough',
}

export enum InlineElementType {
  CODE_SPAN = 'code-span',
  LINK = 'link',
}

export enum BlockElementType {
  PARAGRAPH = 'paragraph',
  HEADING_1 = 'heading-1',
  HEADING_2 = 'heading-2',
  HEADING_3 = 'heading-3',
  HEADING_4 = 'heading-4',
  HEADING_5 = 'heading-5',
  HEADING_6 = 'heading-6',
  OL_LIST = 'ol-list',
  UL_LIST = 'ul-list',
  BLOCK_QUOTE = 'block-quote',
  CODE_BLOCK = 'code-block',
  IMAGE = 'image',
  BUTTON = 'button',
  MUSIC = 'music',
}

export const SHORTCUTS = {
  [BlockElementType.OL_LIST]: [
    '1.',
    '2.',
    '3.',
    '4.',
    '5.',
    '6.',
    '7.',
    '8.',
    '9.',
  ],
  [BlockElementType.UL_LIST]: ['*', '-', '+'],
  [BlockElementType.BLOCK_QUOTE]: ['>'],
  [BlockElementType.HEADING_1]: ['#'],
  [BlockElementType.HEADING_2]: ['##'],
  [BlockElementType.HEADING_3]: ['###'],
  [BlockElementType.HEADING_4]: ['####'],
  [BlockElementType.HEADING_5]: ['#####'],
  [BlockElementType.HEADING_6]: ['######'],
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

export const NON_WRAPPING_ELEMENTS: ElementType[] = [
  BlockElementType.HEADING_1,
  BlockElementType.HEADING_2,
  BlockElementType.HEADING_3,
  BlockElementType.HEADING_4,
  BlockElementType.HEADING_5,
  BlockElementType.HEADING_6,
];

export const NON_EMPTY_ELEMENTS: ElementType[] = [
  BlockElementType.OL_LIST,
  BlockElementType.UL_LIST,
  BlockElementType.BLOCK_QUOTE,
];

/************************************************
 * ✨ code-block
 ************************************************/

export const enum Language {
  PLAINTEXT = 'plaintext',
  JAVASCRIPT = 'javascript',
  JSX = 'jsx',
  TYPESCRIPT = 'typescript',
  TSX = 'tsx',
  MARKUP = 'markup',
  MARKDOWN = 'markdown',
  CSS = 'css',
  JSON = 'json',
  PYTHON = 'python',
  JAVA = 'java',
  PHP = 'php',
  RUBY = 'ruby',
  C = 'c',
  CPP = 'cpp',
  CSHARP = 'csharp',
  GO = 'go',
  RUST = 'rust',
  SQL = 'sql',
  BASH = 'bash',
  DOCKER = 'docker',
  NGINX = 'nginx',
  YAML = 'yaml',
  TOML = 'toml',
  LESS = 'less',
  SCSS = 'scss',
}
