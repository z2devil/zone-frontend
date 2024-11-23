import OpenAI from 'openai';

export const openai = new OpenAI({
  baseURL: 'https://api.chatanywhere.tech',
  apiKey: '***REMOVED***',
  dangerouslyAllowBrowser: true,
});

export interface Message {
  id: string;
  role: 'system' | 'assistant' | 'user';
  content: string;
}
