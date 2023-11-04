import { TokenizerAndRendererExtension } from 'marked';
import { INLINE_ELEMENTS, InlineElements } from './constans';

enum ExtensionLevels {
  INLINE = 'inline',
  BLOCK = 'block',
}

const extensions: TokenizerAndRendererExtension[] = [
  {
    name: InlineElements.CODESPAN,
    level: ExtensionLevels.INLINE,
    start(src) {
      return src.match(`/${INLINE_ELEMENTS[InlineElements.CODESPAN].pattern}/`)
        ?.index;
    },
    tokenizer(src, tokens) {
      const rule = new RegExp(
        `^${INLINE_ELEMENTS[InlineElements.CODESPAN].pattern}([^${
          INLINE_ELEMENTS[InlineElements.CODESPAN].pattern
        }]+)${INLINE_ELEMENTS[InlineElements.CODESPAN].pattern}`
      );
      const match = rule.exec(src);
      if (match) {
        return {
          type: InlineElements.CODESPAN,
          raw: match[0],
          content: match[1].trim(),
        };
      }
    },
    renderer(token) {
      return `<${INLINE_ELEMENTS[InlineElements.CODESPAN].tag} class="hhh">${
        token.content
      }</${INLINE_ELEMENTS[InlineElements.CODESPAN].tag}>`;
    },
  },
  {
    name: InlineElements.UNDERLINE,
    level: ExtensionLevels.INLINE,
    start(src) {
      return src.match(`/${INLINE_ELEMENTS[InlineElements.UNDERLINE].pattern}/`)
        ?.index;
    },
    tokenizer(src, tokens) {
      const rule = new RegExp(
        `^${INLINE_ELEMENTS[InlineElements.UNDERLINE].pattern}([^${
          INLINE_ELEMENTS[InlineElements.UNDERLINE].pattern
        }]+)${INLINE_ELEMENTS[InlineElements.UNDERLINE].pattern}`
      );
      const match = rule.exec(src);
      if (match) {
        return {
          type: InlineElements.UNDERLINE,
          raw: match[0],
          content: match[1],
        };
      }
    },
    renderer(token) {
      return `<${INLINE_ELEMENTS[InlineElements.UNDERLINE].tag}>${
        token.content
      }</${INLINE_ELEMENTS[InlineElements.UNDERLINE].tag}>`;
    },
  },
];

export default extensions;
