enum InlineElements {
  TEXT = 'text',
  CODESPAN = 'codespan',
  EM = 'em',
  DEL = 'del',
  UNDERLINE = 'underline',
  STRONG = 'strong',
  LINK = 'link',
  IMAGE = 'image',
  BR = 'br',
}

const TAG_PREFIX = 'z2-';

const INLINE_ELEMENTS: Record<
  InlineElements,
  {
    pattern?: string;
    tag: string;
  }
> = {
  [InlineElements.TEXT]: {
    tag: `${TAG_PREFIX}text`,
  },
  [InlineElements.CODESPAN]: {
    pattern: '`',
    tag: `${TAG_PREFIX}code`,
  },
  [InlineElements.EM]: {
    pattern: '*',
    tag: `${TAG_PREFIX}em`,
  },
  [InlineElements.DEL]: {
    pattern: '~',
    tag: `${TAG_PREFIX}del`,
  },
  [InlineElements.UNDERLINE]: {
    pattern: '_',
    tag: `${TAG_PREFIX}underline`,
  },
  [InlineElements.STRONG]: {
    pattern: '**',
    tag: `${TAG_PREFIX}strong`,
  },
  [InlineElements.LINK]: {
    tag: `${TAG_PREFIX}link`,
  },
  [InlineElements.IMAGE]: {
    tag: `${TAG_PREFIX}image`,
  },
  [InlineElements.BR]: {
    tag: `${TAG_PREFIX}br`,
  },
};

export { InlineElements, INLINE_ELEMENTS };
