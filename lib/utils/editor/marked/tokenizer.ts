import { TokenizerObject } from 'marked';

const tokenizer: TokenizerObject = {
  codespan(src) {
    const match = src.match(/^`([^`]+)`/);
    if (match) {
      return {
        type: 'codespan',
        raw: match[0],
        text: match[1].trim(),
      };
    }

    return false;
  },
};

export default tokenizer;
