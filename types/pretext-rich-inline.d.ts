declare module '@chenglou/pretext/rich-inline' {
  export type RichInlineItem = {
    text: string;
    font: string;
    letterSpacing?: number;
    break?: 'normal' | 'never';
    extraWidth?: number;
  };

  declare const preparedRichInlineBrand: unique symbol;

  export type PreparedRichInline = {
    readonly [preparedRichInlineBrand]: true;
  };

  export type RichInlineStats = {
    lineCount: number;
    maxLineWidth: number;
  };

  export function prepareRichInline(
    items: RichInlineItem[]
  ): PreparedRichInline;

  export function measureRichInlineStats(
    prepared: PreparedRichInline,
    maxWidth: number
  ): RichInlineStats;
}
