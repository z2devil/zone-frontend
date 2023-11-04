import { MarkedOptions } from 'marked';
import sanitize from 'sanitize-html';
import { INLINE_ELEMENTS } from './constans';

const extensionTags = Object.values(INLINE_ELEMENTS).map(
  element => element.tag
);

const hooks: {
  preprocess: (markdown: string) => string | Promise<string>;
  postprocess: (html: string) => string | Promise<string>;
  options?: MarkedOptions;
} = {
  preprocess: async markdown => {
    return markdown;
  },
  postprocess: async html => {
    return sanitize(html, {
      allowedTags: sanitize.defaults.allowedTags.concat(extensionTags),
    });
  },
};

export default hooks;
