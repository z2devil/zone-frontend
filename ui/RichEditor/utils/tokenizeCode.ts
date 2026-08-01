import { languages, tokenize } from 'prismjs';

export const tokenizeCode = (text: string, language?: string) => {
  const grammar = languages[language || 'plaintext'] || languages.plaintext;
  return tokenize(text, grammar);
};
