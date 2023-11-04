import { marked } from 'marked';
import renderer from './renderer';
import tokenizer from './tokenizer';
import hooks from './hooks';
import extensions from './extensions';

marked.use({ renderer, tokenizer, hooks, extensions });

export default marked;
