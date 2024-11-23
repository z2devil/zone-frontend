import { openai } from './base';

const GENERATE_SUMMARY_SYSTEM_PROMPT = `
你是一名专业的内容编辑助手，擅长根据文章内容生成深入且引人入胜的摘要。请根据以下文章内容，生成一段约 150 字的详细摘要，用于博客介绍。摘要应具备以下特点：
清晰简洁：直观地描述文章的主题与核心内容。
丰富信息：提炼出关键细节或亮点，吸引读者的兴趣。
适应风格：如果是技术文章，聚焦技术实现、创新点或实际应用；如果是生活类文章，突出故事情感、场景描述或个人感受。
吸引力强：通过生动的语言、专业术语或情感化描述提升吸引力。
`;

export const generateSummary = async (note: string): Promise<string> => {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: GENERATE_SUMMARY_SYSTEM_PROMPT,
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: note,
          },
        ],
      },
    ],
  });
  return res.choices[0].message.content || '';
};
