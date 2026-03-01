import OpenAI from 'openai';
import { configs } from '../constants';

export const openai = new OpenAI({
  baseURL: configs.ai.baseURL,
  apiKey: configs.ai.apiKey,
  dangerouslyAllowBrowser: true,
});

export interface Message {
  id: string;
  role: 'system' | 'assistant' | 'user';
  content: string;
}
