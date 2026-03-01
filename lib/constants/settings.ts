export const configs = {
  /**
   * 标题
   */
  title: process.env.TITLE,

  /**
   * 描述
   */
  description: process.env.DESCRIPTION,

  /**
   * 作者
   */
  author: process.env.AUTHOR,

  /**
   * 基础 URL
   */
  baseURL: process.env.BASE_URL,

  /**
   * 请求相关
   */
  request: {
    // 后端接口地址
    baseURL: `${process.env.BASE_URL}/api`,

    // oss 地址
    downloadUrl: `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT}/`,

    // 请求超时时间: 30000,
    timeout: 30000,

    // 请求体数据类型
    contentType: 'application/json; charset=utf-8',

    // 请求头名称
    header: 'Authorization',

    // token 过期时间
    tokenExpires: 30,
  },

  /**
   * oss 相关
   */
  oss: {
    accessid: process.env.OSS_ACCESSID,
    endpoint: process.env.OSS_ENDPOINT,
    bucket: process.env.OSS_BUCKET,
    root: process.env.OSS_ROOT,
    maxImageSize: process.env.OSS_MAX_IMAGE_SIZE,
  },

  /**
   * ai 相关
   */
  ai: {
    baseURL: process.env.AI_BASE_URL,
    apiKey: process.env.AI_API_KEY,
  },

  /**
   * 关于页面
   */
  aboutNoteId: process.env.ABOUT_NOTE_ID,
};
