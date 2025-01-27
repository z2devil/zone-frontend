import { openai } from './base';

const GENERATE_SUMMARY_SYSTEM_PROMPT = `
你是一名专业的内容编辑助手，请根据以下要求生成精炼的博客摘要（严格控制在100字内）：

# 核心原则
1. **信息密度优先**
   - 首句直击核心：用"本文"开头，15字内点明核心主题
   - 技术类：包含技术栈/方法论/实现效果（如"基于Vue3的组合式API实现..."）
   - 教程类：明确步骤数量与最终成果（如"通过3个步骤实现..."）

2. **结构化表达**
   - 技术文章采用：问题陈述 → 解决方案 → 技术亮点
   - 教程文章采用：目标场景 → 实现路径 → 应用价值
   - 观点文章采用：矛盾点 → 论证逻辑 → 结论启示

3. **吸引力强化**
   - 技术类：使用数据支撑（效率提升%/性能指标）
   - 教程类：添加适用场景说明（"适合XX场景的开发者"）
   - 通用：结尾添加行动号召（"点击了解详细实现"）

# 避坑指南
❌ 避免被动语态（"被设计"/"被实现"）
❌ 禁止使用第一人称（"我们"/"笔者"）
❌ 拒绝模糊表述（"一定程度"/"相关技术"）
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
            // 添加内容类型标识提升准确性
            text: `内容类型：${detectContentType(note)}\n待处理内容：\n${note}`,
          },
        ],
      },
    ],
    temperature: 0.3, // 降低随机性保证专业度
    max_tokens: 300, // 给予少量溢出空间
    stop: ['\n\n'], // 防止生成多段落
  });

  // 后处理优化
  const rawSummary = res.choices[0].message.content || '';
  return formatSummary(rawSummary);
};

// 辅助函数：内容类型检测
const detectContentType = (text: string): string => {
  const techKeywords = ['实现', '原理', '源码'];
  const tutorialKeywords = ['步骤', '教程', '如何'];
  return techKeywords.some(k => text.includes(k))
    ? '技术分析'
    : tutorialKeywords.some(k => text.includes(k))
      ? '实践教程'
      : '观点论述';
};

// 辅助函数：格式标准化
const formatSummary = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') // 合并多余空格
    .replace(/\.(\S)/g, '. $1') // 确保句末空格
    .replace(/^"|"$/g, ''); // 去除头尾引号
};

const GENERATE_TITLE_SYSTEM_PROMPT = `
你是一名专业的标题创作助手，擅长根据文章内容提炼出简洁有力的标题。请根据以下内容生成一个不超过**15个字**的标题，要求：
1. 核心聚焦：准确反映文章核心主题或独特观点
2. 关键词前置：优先使用文章中的关键术语/核心概念
3. 吸引力强：使用数字、对比、悬念等技巧增强点击欲
4. 风格适配：
   - 技术类：突出技术方案/创新点（如"基于XXX的YYY系统实现"）
   - 教程类：明确结果导向（如"三步实现ZZZ效果"）
   - 观点类：使用引发思考的句式（如"为什么说AAA是BBB的未来？"）
5. 避免使用冗余词（"浅谈"/"关于"/"我的"等）
`;

export const generateTitle = async (note: string): Promise<string> => {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: GENERATE_TITLE_SYSTEM_PROMPT,
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `待处理内容：\n${note}`,
          },
        ],
      },
    ],
    // 增加温度系数控制创造性
    temperature: 0.7,
    // 限制输出长度
    max_tokens: 20,
  });

  // 清洗可能包含的引号
  const rawTitle = res.choices[0].message.content || '';
  return rawTitle.replace(/^["']+|["']+$/g, '');
};
