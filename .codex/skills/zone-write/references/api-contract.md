# Zone 内容 API 契约

## 目标与认证

- 默认 API：`https://z2devil.cn/api`
- `GET /auth/code?email=...`：发送 4 位邮箱验证码。
- `POST /auth/sign`：使用 `{ email, code }` 换取 Token。
- `GET /auth/info`：验证 Token，并返回当前用户信息。
- `GET /oss/policy`：获取短期 OSS 表单上传凭证；需要管理员 Token。
- 认证头：`Authorization: <token>`。
- 写入笔记需要管理员权限。
- Token 默认存入 macOS Keychain；`ZONE_AUTH_TOKEN` 仅作为优先级更高的临时覆盖。
- Token 和验证码不得进入命令参数、普通文件、日志或错误输出。

响应统一为：

```json
{ "code": 200, "data": {}, "message": null }
```

HTTP 200 不代表业务成功；CLI 必须同时检查响应体 `code === 200`。后端对齐后错误响应的
HTTP 状态码与 `code` 一致，非 2xx 响应体同样是该 envelope，错误信息从中读取。

## 内容接口

- `POST /note`：创建笔记。
- `PUT /note`：更新笔记。
- `GET /note/:id`：查询单篇；私密内容需要作者 Token。
- `GET /note?current=1&size=20`：分页查询。
- `GET /tag?current=1&size=50`：查询现有标签。
- `GET /auth/info`：验证 Token。

## 图片上传

- 从 `.env.production` 读取公开的 `OSS_BUCKET`、`OSS_ENDPOINT`、`OSS_ROOT`；可用对应的 `ZONE_OSS_*` 环境变量覆盖。
- 使用 `GET /oss/policy` 返回的 `policy`、`signature`、`accessKeyId` 直接表单上传，不接触 OSS Secret。
- 对文件内容计算 SHA-256 短摘要作为名称，图片保存到 `<OSS_ROOT>/image/<digest>.<ext>`。
- 正文和封图只保存站内相对路径，例如 `zone/image/example.png`。
- 允许 PNG、JPEG、GIF、WebP、AVIF、SVG，单个文件最大 25MB。
- 图片上传后再写笔记；笔记写入成功后必须用 `GET /note/:id` 回查。
- 回查必须验证标题、可见性、正文 JSON、Slate 节点结构和代码语言兼容性；不能只以写接口成功作为完成条件。

创建字段：

```text
title       必填，1-150 字符
content     必填，序列化后的 Slate JSON
visibility  public | private
tags        最多 5 个标签 ID
bannerPath  可选
```

更新还需要 `_id`。未传 `visibility`、`tags`、`bannerPath` 时不要生成这些字段，以保留线上原值。

## 内容模型

Zone 没有独立的 Article 或 Draft 数据类型。CLI 的 `kind=note|article` 只影响内容检查和整理方式，不发送到后端。私密草稿通过 `visibility=private` 实现，但它仍是已持久化的 Note。

代码块语言必须规范化为前端支持的名称。常见别名如 `js`、`ts`、`sh`、`yml` 分别转换为 `javascript`、`typescript`、`bash`、`yaml`；`mermaid` 保留原语言供后续图表渲染，当前按源码安全显示；其他未知语言使用 `plaintext`。非 Prism 高亮语言同时给出 warning。

折叠块由三层节点组成：`collapsible-block`（`collapsed` 表示作者设置的默认折叠状态）> `collapsible-block-title`（一个段落）+ `collapsible-block-content`（至少一个块）。CLI 将 Markdown 中的 `<details><summary>标题</summary> … </details>` 转为该结构，`<details open>` 对应 `collapsed: false`，否则为 `true`。CLI 目前只支持 Markdown → Slate 单向转换，没有反向导出。
