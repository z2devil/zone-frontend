export const configs = {
  /**
   * 标题
   */
  title: '中二Devil的个人博客',

  /**
   * 作者
   */
  author: '中二Devil',
  /**
   * 请求相关
   */
  request: {
    // 后端接口地址
    baseURL: `${process.env.BASE_URL}/api`,

    // oss 地址
    downloadUrl: 'https://z2devil-bucket.oss-cn-beijing.aliyuncs.com/',

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
    accessid: '***REMOVED***',
    endpoint: 'oss-cn-beijing.aliyuncs.com',
    bucket: 'z2devil-bucket',
    root: 'blog/',
    //上传图片最大大小（15MB）
    maxImageSize: 15 * 1024 * 1024,
  },
};
